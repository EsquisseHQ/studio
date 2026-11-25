import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('a creator can iterate, download the accepted quote and recover the rendered image', async ({ page }) => {
  await page.goto('/')
  await page.getByText('4:5', { exact: true }).click()
  await page.getByLabel('Description', { exact: true }).fill('Flacon ambré au flash direct')
  await expect(page.locator('.total dd')).toContainText('0,06')
  await page.getByRole('button', { name: 'Générer une variation' }).click()
  const png = page.getByRole('link', { name: 'Télécharger le PNG' })
  await expect(png).toBeVisible()
  const url = await png.getAttribute('href')
  const download = page.waitForEvent('download')
  await png.click()
  const bytes = await readFile((await (await download).path())!)
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1024, 1280])
  const receiptDownload = page.waitForEvent('download')
  await page.getByRole('link', { name: 'Reçu JSON' }).click()
  const receipt = JSON.parse(await readFile((await (await receiptDownload).path())!, 'utf8'))
  expect(receipt.quote.totalCents).toBe(6)
  expect(receipt.chargedCents).toBe(0)
  expect(url).toContain(receipt.quote.id)
  await page.reload()
  await expect(png).toHaveAttribute('href', url!)
  await page.getByRole('button', { name: 'Reprendre les réglages' }).click()
  await expect(page.getByLabel('Description', { exact: true })).toHaveValue(receipt.prompt)
})

test('concurrent acceptances and later retries recover one receipt', async ({ request }) => {
  const quote = await (await request.post('/api/studio/quote', { data: { format: '1:1' } })).json()
  const data = { quoteId: quote.id, prompt: 'Verre ambré' }
  const submit = () => request.post('/api/studio/generate', { data })
  const responses = await Promise.all([submit(), submit()])
  for (const response of responses) expect(response.status()).toBe(200)
  const [first, second] = await Promise.all(responses.map(res => res.json()))
  expect(second).toEqual(first)
  expect(first.quote).toEqual(quote)
  expect(await (await submit()).json()).toEqual(first)
  expect((await request.post('/api/studio/generate', { data: { ...data, prompt: 'Autre essai' } })).status()).toBe(409)
})

test('only a supported format and an existing server quote can generate a result', async ({ request }) => {
  expect((await request.post('/api/studio/quote', { data: { format: '8K' } })).status()).toBe(400)
  const quote = await (await request.post('/api/studio/quote', {
    data: { format: '1:1', totalCents: 1, studioCents: 0 }
  })).json()
  expect(quote.totalCents).toBe(5)
  expect(quote.studioCents).toBe(1)
  expect((await request.post('/api/studio/generate', { data: { quoteId: quote.id, prompt: '  ' } })).status()).toBe(400)
  expect((await request.get('/api/studio/receipt?id=' + quote.id)).status()).toBe(404)
})
