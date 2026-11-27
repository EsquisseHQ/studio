export const formats = ['1:1', '4:5', '16:9'] as const
export type Format = typeof formats[number]
export const examplePrompt = 'Un flacon de parfum ambré sur du travertin. Une lumière de fin de journée traverse le verre.'
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
export type AttemptStatus = { state: 'pending' | 'review' | 'failed'; message: string; id: string }
export type Outcome = Receipt | AttemptStatus
export const fluxRate = 'bfl-flux-pro-1.1-usd-2026-11-27'
export const money = (cents: number, currency: Quote['currency'] = 'EUR') =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency })
