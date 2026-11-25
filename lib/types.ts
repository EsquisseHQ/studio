export const formats = ['1:1', '4:5', '16:9'] as const
export type Format = typeof formats[number]
export const examplePrompt = 'Un flacon de parfum ambré sur du travertin. Une lumière de fin de journée traverse le verre.'
export type Quote = {
  id: string; format: Format; rate: string; currency: 'EUR'; providerCents: number;
  studioCents: number; taxCents: number; totalCents: number; expiresAt: string
}
export type Receipt = {
  id: string; quote: Quote; prompt: string; model: string; simulated: true;
  chargedCents: number; createdAt: string; width: number; height: number
}
export const money = (cents: number) => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
