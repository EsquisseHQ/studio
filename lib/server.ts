import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { displayReceipt, fluxRate, type AttemptStatus, type Format, type Quote, type Receipt } from './types'
import { fluxProviderCents, trialFeeCents } from './catalog'
import { pollFlux, submitFlux } from './bfl'

const local = globalThis as typeof globalThis & { esquisseDb?: DatabaseSync }
function db() {
  if (local.esquisseDb) return local.esquisseDb
  const dir = path.resolve(process.env.ESQUISSE_DATA_DIR || '.esquisse')
  mkdirSync(dir, { recursive: true })
  const connection = new DatabaseSync(path.join(dir, 'studio.sqlite'))
  connection.exec(`PRAGMA busy_timeout=5000;
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS quotes (id TEXT PRIMARY KEY, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY REFERENCES quotes(id), receipt TEXT NOT NULL, image BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS flux_attempts (
      id TEXT PRIMARY KEY REFERENCES quotes(id), prompt TEXT NOT NULL, started INTEGER NOT NULL,
      state TEXT NOT NULL, request_id TEXT, polling_url TEXT, message TEXT);`)
  local.esquisseDb = connection
  return connection
}
const settings = {
  '1:1': { width: 1024, height: 1024, providerCents: 4 },
  '4:5': { width: 1024, height: 1280, providerCents: 5 },
  '16:9': { width: 1280, height: 720, providerCents: 4 }
}
export class StudioError extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}
export function quoteFor(format: Format, model: 'demo' | 'flux' = 'demo'): Quote {
  const live = model === 'flux'
  if (live && format !== '1:1') throw new StudioError(400, 'The FLUX trial supports square 1024 × 1024 images.')
  const providerCents = live ? fluxProviderCents : settings[format].providerCents
  const studioCents = trialFeeCents
  const quote: Quote = { id: randomUUID(), format, rate: live ? fluxRate : 'demo-v1', currency: live ? 'USD' : 'EUR', providerCents,
    studioCents, taxCents: 0, totalCents: providerCents + studioCents, expiresAt: new Date(Date.now() + 900_000).toISOString() }
  db().prepare('INSERT INTO quotes VALUES (?, ?)').run(quote.id, JSON.stringify(quote))
  return quote
}
export function receiptFor(id: string): Receipt | undefined {
  const row = db().prepare('SELECT receipt FROM jobs WHERE id = ?').get(id)
  return row && displayReceipt(JSON.parse(String(row.receipt)))
}
export function imageFor(id: string) {
  return db().prepare('SELECT image FROM jobs WHERE id = ?').get(id)?.image as Uint8Array | undefined
}
function replay(receipt: Receipt, prompt: string) {
  if (receipt.prompt !== prompt) throw new StudioError(409, 'This quote was already used for a different prompt.')
  return receipt
}
function attemptFor(id: string) {
  return db().prepare('SELECT * FROM flux_attempts WHERE id = ?').get(id)
}
const pending = (id: string, message = 'Black Forest Labs is generating the image.'): AttemptStatus => ({ id, state: 'pending', message })
const uncertain = 'Check your BFL account to see whether the request was received. This attempt will not be submitted again.'

export async function statusFor(id: string): Promise<Receipt | AttemptStatus> {
  const receipt = receiptFor(id)
  if (receipt) return receipt
  const attempt = attemptFor(id)
  if (!attempt) throw new StudioError(404, 'Attempt not found.')
  if (attempt.state === 'failed') return { id, state: 'failed', message: String(attempt.message)
    .replace('BFL a refusé la demande (HTTP ', 'BFL rejected the request (HTTP ')
    .replace('Vérifie la clé et les crédits.', 'Check your API key and credit balance.')
    .replace('BFL a terminé cet essai sans livrer d’image (', 'BFL finished the attempt without delivering an image (') }
  if (attempt.state === 'review' || (attempt.state === 'submitting' && Date.now() - Number(attempt.started) > 30_000))
    return { id, state: 'review', message: uncertain }
  if (attempt.state === 'submitting') return pending(id, 'Submitting to Black Forest Labs…')
  const key = process.env.BFL_API_KEY
  if (!key) throw new StudioError(503, 'Set your BFL key to resume this attempt.')
  const quote: Quote = JSON.parse(String(db().prepare('SELECT payload FROM quotes WHERE id = ?').get(id)!.payload))
  try {
    const result = await pollFlux(String(attempt.polling_url), key)
    if (result.bytes) {
      const { data, info } = await sharp(result.bytes, { limitInputPixels: 4096 * 4096 }).png().toBuffer({ resolveWithObject: true })
      const completed: Receipt = { id, quote, prompt: String(attempt.prompt), model: 'FLUX 1.1 [pro]', simulated: false,
        providerRequestId: String(attempt.request_id), chargedCents: 0, createdAt: new Date().toISOString(), width: info.width, height: info.height,
        billing: { providerPayer: 'BFL account holder', providerQuotedCents: quote.providerCents, studioCollectedCents: 0 } }
      db().prepare('INSERT OR IGNORE INTO jobs VALUES (?, ?, ?)').run(id, JSON.stringify(completed), data)
      return receiptFor(id)!
    }
    if (['Error', 'Failed', 'Request Moderated', 'Content Moderated', 'Task not found'].includes(result.status)) {
      const message = 'BFL finished the attempt without delivering an image (' + result.status + ').'
      db().prepare("UPDATE flux_attempts SET state='failed', message=? WHERE id=?").run(message, id)
      return { id, state: 'failed', message }
    }
    return pending(id)
  } catch { return pending(id, 'The result is temporarily unavailable. Checking the same attempt again…') }
}

export async function generate(id: string, prompt: string) {
  const previous = receiptFor(id)
  if (previous) return replay(previous, prompt)
  const row = db().prepare('SELECT payload FROM quotes WHERE id = ?').get(id)
  if (!row) throw new StudioError(404, 'Quote not found.')
  const quote: Quote = JSON.parse(String(row.payload))
  const existing = attemptFor(id)
  if (existing) {
    if (existing.prompt !== prompt) throw new StudioError(409, 'This quote has already been used.')
    return statusFor(id)
  }
  if (Date.parse(quote.expiresAt) <= Date.now()) throw new StudioError(410, 'This quote has expired. Refresh it to get a new price.')
  if (quote.rate === fluxRate) {
    const key = process.env.BFL_API_KEY
    if (!key) throw new StudioError(503, 'Set BFL_API_KEY in .env.local and restart the studio.')
    const claim = db().prepare("INSERT OR IGNORE INTO flux_attempts (id,prompt,started,state) VALUES (?,?,?,'submitting')")
      .run(id, prompt, Date.now())
    if (!claim.changes) {
      if (attemptFor(id)?.prompt !== prompt) throw new StudioError(409, 'This quote has already been used.')
      return statusFor(id)
    }
    try {
      const ack = await submitFlux(prompt, key)
      if (ack.rejected) {
        const message = 'BFL rejected the request (HTTP ' + ack.rejected + '). Check your API key and credit balance.'
        db().prepare("UPDATE flux_attempts SET state='failed', message=? WHERE id=?").run(message, id)
        return { id, state: 'failed' as const, message }
      }
      db().prepare("UPDATE flux_attempts SET state='polling',request_id=?,polling_url=? WHERE id=?")
        .run(ack.requestId!, ack.pollingUrl!, id)
    } catch {
      db().prepare("UPDATE flux_attempts SET state='review' WHERE id=?").run(id)
      return { id, state: 'review' as const, message: uncertain }
    }
    return pending(id)
  }
  const { width, height } = settings[quote.format]
  const seed = createHash('sha256').update(prompt).digest()
  const image = await sharp(path.join(process.cwd(), 'public', 'atelier.webp'))
    .resize(width, height, { fit: 'cover' })
    .modulate({ brightness: 0.87 + seed[0] / 900, saturation: 0.65 + seed[1] / 380 })
    .png().toBuffer()
  const receipt: Receipt = { id, quote, prompt, model: 'Esquisse Demo', simulated: true, chargedCents: 0,
    createdAt: new Date().toISOString(), width, height }
  db().prepare('INSERT OR IGNORE INTO jobs (id, receipt, image) VALUES (?, ?, ?)').run(id, JSON.stringify(receipt), image)
  return replay(receiptFor(id)!, prompt)
}
