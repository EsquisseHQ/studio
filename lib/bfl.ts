import { z } from 'zod'

function providerUrl(raw: string) {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.bfl.ai') || url.port || url.username || url.password)
    throw new Error('Unexpected BFL URL.')
  return url
}

function bflFetch(url: URL, key?: string, body?: object) {
  const headers = new Headers()
  if (key) headers.set('x-key', key)
  if (body) headers.set('Content-Type', 'application/json')
  return fetch(url, { method: body ? 'POST' : 'GET', body: body && JSON.stringify(body),
    headers, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20_000) })
}

export async function submitFlux(prompt: string, key: string) {
  const res = await bflFetch(new URL('https://api.bfl.ai/v1/flux-pro-1.1'), key,
    { prompt, width: 1024, height: 1024, output_format: 'png' })
  if ([400, 401, 402, 403, 422, 429].includes(res.status)) return { rejected: res.status } as const
  if (!res.ok) throw new Error('BFL did not acknowledge the request.')
  const ack = z.object({ id: z.string().min(1), polling_url: z.string() }).parse(await res.json())
  return { requestId: ack.id, pollingUrl: providerUrl(ack.polling_url).href } as const
}

export async function pollFlux(pollingUrl: string, key: string) {
  const res = await bflFetch(providerUrl(pollingUrl), key)
  if (!res.ok) throw new Error('Provider status is unavailable.')
  const data = z.object({ status: z.string(), result: z.object({ sample: z.string() }).nullish() }).passthrough()
  // Pending and failed jobs can have a null or unpopulated result object.
  const body = await res.json()
  const { status } = z.object({ status: z.string() }).parse(body)
  if (status !== 'Ready') return { status }
  const sample = data.parse(body).result?.sample
  if (!sample) throw new Error('Image unavailable.')
  const response = await bflFetch(providerUrl(sample))
  if (!response.ok) throw new Error('Download interrupted.')
  return { status, bytes: Buffer.from(await response.arrayBuffer()) }
}
