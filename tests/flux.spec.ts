import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import type { Quote, Receipt } from '../lib/types'

async function countSubmissions(prompt: string) {
  const log = await readFile(process.env.ESQUISSE_TEST_CALLS!, 'utf8')
  return log.trim().split('\n').filter(line => JSON.parse(line).prompt === prompt).length
}

test('a FLUX attempt survives a reload and a failed poll and downloads one image', async ({ page, request }) => {
  const prompt = 'Golden bottle in hard sunlight'
  await page.goto('/image')
  await page.getByLabel('Modèle', { exact: true }).selectOption('flux')
  await page.getByLabel('Description', { exact: true }).fill(prompt)
  await expect(page.getByLabel('Détail du prix')).toContainText('0,05')
  const accepted = page.waitForResponse(res => res.url().endsWith('/generate') && res.ok())
  await page.getByRole('button', { name: /Générer/ }).click()
  const { id } = await (await accepted).json()
  await page.reload()
  await expect(page.getByRole('link', { name: 'Télécharger le PNG' })).toBeVisible()
  const receipt: Receipt = await (await request.get('/api/studio/receipt?id=' + id)).json()
  expect(receipt.quote).toMatchObject({ id, currency: 'USD', providerCents: 4, studioCents: 1, totalCents: 5 })
  expect(receipt).toMatchObject({ prompt, simulated: false, chargedCents: 0, width: 1024, height: 1024 })
  expect(receipt.providerRequestId).toBeTruthy()
  expect(receipt.billing).toEqual({ providerPayer: 'BFL account holder', providerQuotedCents: 4, studioCollectedCents: 0 })
  const image = await request.get('/api/studio/image?id=' + id + '&download=1')
  expect((await image.body()).subarray(1, 4).toString()).toBe('PNG')
  expect(await countSubmissions(prompt)).toBe(1)
})

test('concurrent accepts and a lost acknowledgement never repeat the paid POST', async ({ request }) => {
  const prompt = 'Lost acknowledgement'
  const quote: Quote = await (await request.post('/api/studio/quote', { data: { format: '1:1', model: 'flux' } })).json()
  const submit = () => request.post('/api/studio/generate', { data: { quoteId: quote.id, prompt } })
  await Promise.all([submit(), submit()])
  expect(await (await submit()).json()).toMatchObject({ id: quote.id, state: 'review' })
  expect((await request.post('/api/studio/generate', { data: { quoteId: quote.id, prompt: 'Another prompt' } })).status()).toBe(409)
  expect(await countSubmissions(prompt)).toBe(1)
})

test('a refused FLUX submission reports the provider response and cannot be replayed as a new job', async ({ request }) => {
  const quote = await (await request.post('/api/studio/quote', { data: { model: 'flux', format: '1:1' } })).json()
  const prompt = 'Empty account'
  const submit = () => request.post('/api/studio/generate', { data: { quoteId: quote.id, prompt } })
  expect(await (await submit()).json()).toMatchObject({ state: 'failed', message: expect.stringContaining('402') })
  expect(await (await submit()).json()).toMatchObject({ state: 'failed' })
  expect(await countSubmissions(prompt)).toBe(1)
})
