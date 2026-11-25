import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import sharp from 'sharp'
import type { Format, Quote, Receipt } from './types'

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
    CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY REFERENCES quotes(id), receipt TEXT NOT NULL, image BLOB NOT NULL);`)
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
export function quoteFor(format: Format): Quote {
  const { providerCents } = settings[format]
  const studioCents = 1
  const quote: Quote = { id: randomUUID(), format, rate: 'demo-v1', currency: 'EUR', providerCents,
    studioCents, taxCents: 0, totalCents: providerCents + studioCents, expiresAt: new Date(Date.now() + 900_000).toISOString() }
  db().prepare('INSERT INTO quotes VALUES (?, ?)').run(quote.id, JSON.stringify(quote))
  return quote
}
export function receiptFor(id: string): Receipt | undefined {
  const row = db().prepare('SELECT receipt FROM jobs WHERE id = ?').get(id)
  return row && JSON.parse(String(row.receipt))
}
export function imageFor(id: string) {
  return db().prepare('SELECT image FROM jobs WHERE id = ?').get(id)?.image as Uint8Array | undefined
}
function replay(receipt: Receipt, prompt: string) {
  if (receipt.prompt !== prompt) throw new StudioError(409, 'Ce devis a déjà servi pour une autre description.')
  return receipt
}
export async function generate(id: string, prompt: string) {
  const previous = receiptFor(id)
  if (previous) return replay(previous, prompt)
  const row = db().prepare('SELECT payload FROM quotes WHERE id = ?').get(id)
  if (!row) throw new StudioError(404, 'Devis introuvable.')
  const quote: Quote = JSON.parse(String(row.payload))
  if (Date.parse(quote.expiresAt) <= Date.now()) throw new StudioError(410, 'Le devis a expiré. Actualise le prix.')
  const { width, height } = settings[quote.format]
  const seed = createHash('sha256').update(prompt).digest()
  const image = await sharp(path.join(process.cwd(), 'public', 'atelier.webp'))
    .resize(width, height, { fit: 'cover' })
    .modulate({ brightness: 0.87 + seed[0] / 900, saturation: 0.65 + seed[1] / 380 })
    .png().toBuffer()
  const receipt: Receipt = { id, quote, prompt, model: 'Esquisse Démo', simulated: true, chargedCents: 0,
    createdAt: new Date().toISOString(), width, height }
  db().prepare('INSERT OR IGNORE INTO jobs (id, receipt, image) VALUES (?, ?, ?)').run(id, JSON.stringify(receipt), image)
  return replay(receiptFor(id)!, prompt)
}
