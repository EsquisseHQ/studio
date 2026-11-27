// Loaded only into Playwright's Next.js server. All BFL calls stay in process.
const { randomUUID } = require('node:crypto')
const { readFileSync, appendFileSync } = require('node:fs')
const path = require('node:path')
const originalFetch = global.fetch
const requests = new Map()
global.fetch = async function mockProvider(input, init) {
  const url = new URL(input.url || input)
  if (!url.hostname.endsWith('.bfl.ai')) return originalFetch(input, init)
  const headers = new Headers(init?.headers || input.headers)
  if (url.hostname === 'delivery.test.bfl.ai') {
    if (headers.has('x-key')) throw new Error('Key sent to image delivery host')
    return new Response(readFileSync(path.resolve('public/atelier.webp')))
  }
  if (headers.get('x-key') !== 'test-only') return Response.json({}, { status: 401 })
  if (url.pathname === '/v1/flux-pro-1.1') {
    const body = JSON.parse(init?.body || await input.text())
    appendFileSync(process.env.ESQUISSE_TEST_CALLS, JSON.stringify(body) + '\n')
    if (body.prompt === 'Lost acknowledgement') throw new Error('Disconnected after submission')
    if (body.prompt === 'Empty account') return Response.json({}, { status: 402 })
    const id = randomUUID()
    requests.set(id, 0)
    return Response.json({ id, polling_url: 'https://api.test.bfl.ai/v1/get_result?id=' + id })
  }
  const id = url.searchParams.get('id')
  const count = requests.get(id)
  if (count === undefined) return Response.json({ status: 'Task not found' })
  requests.set(id, count + 1)
  if (count === 0) throw new Error('Polling connection interrupted')
  return Response.json({ status: 'Ready', result: { sample: 'https://delivery.test.bfl.ai/result' } })
}
