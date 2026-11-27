export const formats = ['1:1', '4:5', '16:9'] as const
export type Format = typeof formats[number]
export const examplePrompt = 'An amber perfume bottle on travertine. Late afternoon light shines through the glass.'
export type Quote = {
  id: string; format: Format; rate: string; currency: 'EUR' | 'USD'; providerCents: number;
  studioCents: number; taxCents: number; totalCents: number; expiresAt: string
}
export type Receipt = {
  id: string; quote: Quote; prompt: string; model: string; simulated: boolean;
  providerRequestId?: string;
  billing?: { providerPayer: 'BFL account holder'; providerQuotedCents: number; studioCollectedCents: number };
  chargedCents: number; createdAt: string; width: number; height: number
}
// Older receipts stored the French display name. Preserve the original prompt and quote.
export function displayReceipt(receipt: Receipt): Receipt {
  return receipt.model === 'Esquisse Démo' ? { ...receipt, model: 'Esquisse Demo' } : receipt
}

export type AttemptStatus = { state: 'pending' | 'review' | 'failed'; message: string; id: string }
export type Outcome = Receipt | AttemptStatus
export const fluxRate = 'bfl-flux-pro-1.1-usd-2026-11-27'
export const money = (cents: number, currency: Quote['currency'] = 'EUR') =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency })
