import { z } from 'zod'
import { formats } from '../../../../lib/types'
import { generate, imageFor, quoteFor, receiptFor, statusFor, StudioError } from '../../../../lib/server'

export const runtime = 'nodejs'
type Context = { params: Promise<{ action: string }> }
const error = (message: string, status: number) => Response.json({ error: message }, { status })
export async function POST(request: Request, context: Context) {
  const { action } = await context.params
  const origin = request.headers.get('origin')
  const host = request.headers.get('host') || ''
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host) ||
      (origin && origin !== 'http://' + host && origin !== 'https://' + host))
    return error('Origine inattendue.', 403)
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return error('JSON requis.', 415)
  try {
    const data = await request.json()
    if (action === 'quote') {
      const model = z.enum(['demo', 'flux']).default('demo').parse(data?.model)
      return Response.json({ ...quoteFor(z.enum(formats).parse(data?.format), model),
        ...(model === 'flux' && !process.env.BFL_API_KEY ? { missingKey: true } : {}) })
    }
    if (action === 'status') return Response.json(await statusFor(z.uuid().parse(data?.quoteId)))
    if (action !== 'generate') return error('Action inconnue.', 404)
    const input = z.object({ quoteId: z.uuid(), prompt: z.string().trim().min(1).max(2000) }).parse(data)
    return Response.json(await generate(input.quoteId, input.prompt))
  } catch (err) {
    if (err instanceof StudioError) return error(err.message, err.status)
    if (err instanceof z.ZodError || err instanceof SyntaxError) return error('Vérifie le format et la description.', 400)
    return error('Essai interrompu. Vérifie son état avant de recommencer.', 500)
  }
}
export async function GET(request: Request, context: Context) {
  const { action } = await context.params
  const query = new URL(request.url).searchParams
  const id = query.get('id')
  if (!id || !z.uuid().safeParse(id).success) return error('Identifiant invalide.', 400)
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (action === 'image') {
    const image = imageFor(id)
    if (!image) return error('Image introuvable.', 404)
    headers.set('Content-Type', 'image/png')
    if (query.has('download')) headers.set('Content-Disposition', `attachment; filename="esquisse-${id}.png"`)
    return new Response(new Uint8Array(image), { headers })
  }
  if (action !== 'receipt') return error('Action inconnue.', 404)
  const receipt = receiptFor(id)
  if (!receipt) return error('Essai introuvable.', 404)
  if (query.has('download')) headers.set('Content-Disposition', `attachment; filename="recu-${id}.json"`)
  return Response.json(receipt, { headers })
}
