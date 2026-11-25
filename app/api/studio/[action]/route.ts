import { z } from 'zod'
import { formats } from '../../../../lib/types'
import { generate, imageFor, quoteFor, receiptFor, StudioError } from '../../../../lib/server'

export const runtime = 'nodejs'
type Context = { params: Promise<{ action: string }> }
const error = (message: string, status: number) => Response.json({ error: message }, { status })
export async function POST(request: Request, context: Context) {
  const { action } = await context.params
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin && origin !== 'http://' + request.headers.get('host'))
    return error('Origine inattendue.', 403)
  try {
    const data = await request.json()
    if (action === 'quote') return Response.json(quoteFor(z.enum(formats).parse(data?.format)))
    if (action !== 'generate') return error('Action inconnue.', 404)
    const input = z.object({ quoteId: z.uuid(), prompt: z.string().trim().min(1).max(2000) }).parse(data)
    return Response.json(await generate(input.quoteId, input.prompt))
  } catch (err) {
    if (err instanceof StudioError) return error(err.message, err.status)
    if (err instanceof z.ZodError || err instanceof SyntaxError) return error('Vérifie le format et la description.', 400)
    return error('La simulation a échoué. Tu peux réessayer avec le même devis.', 500)
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
