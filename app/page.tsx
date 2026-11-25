'use client'

import { useEffect, useRef, useState } from 'react'
import { examplePrompt, formats, money, type Format, type Quote, type Receipt } from '../lib/types'

const storageKey = 'esquisse.attempt.v1'
type Saved = { quoteId: string; prompt: string; format: Format }
async function post<T>(action: string, data: unknown): Promise<T> {
  const res = await fetch('/api/studio/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Connexion interrompue.')
  return body
}
const asset = (kind: string, id: string, download = false) =>
  '/api/studio/' + kind + '?id=' + encodeURIComponent(id) + (download ? '&download=1' : '')

export default function Studio() {
  const [prompt, setPrompt] = useState(examplePrompt)
  const [format, setFormat] = useState<Format>('1:1')
  const [quote, setQuote] = useState<Quote>()
  const [receipt, setReceipt] = useState<Receipt>()
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let active = true
    async function restore() {
      try {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return
        const saved: Saved = JSON.parse(raw)
        const response = await fetch(asset('receipt', saved.quoteId))
        // A reload can interrupt the first response before the attempt is stored.
        const last: Receipt = response.status === 404
          ? await post('generate', { quoteId: saved.quoteId, prompt: saved.prompt })
          : await response.json()
        if (!last.quote) throw new Error()
        if (active) { setReceipt(last); setPrompt(last.prompt); setFormat(last.quote.format) }
      } catch {
        if (active) setError('Impossible de reprendre le dernier essai. Tu peux en lancer un nouveau.')
      } finally { if (active) setReady(true) }
    }
    void restore()
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!ready) return
    let active = true
    setQuote(undefined)
    post<Quote>('quote', { format }).then(q => { if (active) setQuote(q) })
      .catch(() => { if (active) setError('Le devis est indisponible. Actualise le prix.') })
    return () => { active = false }
  }, [format, reload, ready])

  async function run() {
    if (lock.current || !quote || quote.format !== format || !prompt.trim()) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const saved: Saved = { quoteId: quote.id, prompt: prompt.trim(), format }
      localStorage.setItem(storageKey, JSON.stringify(saved))
      const result = await post<Receipt>('generate', saved)
      setReceipt(result)
      setQuote(undefined)
      setReload(value => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : 'La simulation a échoué.') }
    finally { lock.current = false; setBusy(false) }
  }
  const price = quote?.format === format ? quote : undefined
  const dims = receipt ? receipt.width + ' × ' + receipt.height : '1024 × 1024'
  return <>
    <header><div className="bar"><a className="brand" href="/"><img src="/esquisse-logo.png" alt="" />Esquisse</a>
      <span className="section">Studio Image</span><a className="source" href="https://github.com/EsquisseHQ/studio">GitHub ↗</a></div></header>
    <main><div className="title"><div><p className="eyebrow">Atelier de création</p><h1>Studio Image</h1></div>
      <span className="mode"><i />Simulation locale</span></div>
      <div className="workspace">
        <section className="canvas"><div className="canvas-head"><h2>{receipt ? 'Dernier rendu' : 'Aperçu du studio'}</h2><span>{dims} px</span></div>
          <div className="frame"><img className="photo" src={receipt ? asset('image', receipt.id) : '/atelier.webp'} alt={receipt ? 'Variation simulée du flacon de parfum ambré' : 'Flacon de parfum ambré sur du travertin éclairé au soleil'} /></div>
          <div className="caption"><div><span className="eyebrow">{receipt ? 'Essai simulé' : 'Exemple de départ'}</span><h3>{receipt ? 'Variation de lumière' : 'Étude de verre ambré'}</h3></div>
            {receipt && <button className="text-button" onClick={() => { setPrompt(receipt.prompt); setFormat(receipt.quote.format); input.current?.focus() }}>Reprendre les réglages ↗</button>}
          </div>
          {receipt && <div className="downloads"><a href={asset('image', receipt.id, true)} download>Télécharger le PNG ↓</a><a href={asset('receipt', receipt.id, true)} download>Reçu JSON ↓</a><span>Débité · {money(receipt.chargedCents)}</span></div>}
        </section>
        <form onSubmit={e => { e.preventDefault(); void run() }}>
          <h2>Composer</h2><div className="model"><span>Modèle</span><strong>Esquisse Démo</strong></div>
          <label htmlFor="prompt">Description</label><textarea ref={input} id="prompt" value={prompt} maxLength={2000} disabled={busy || !ready} onChange={e => setPrompt(e.target.value)} />
          <p className="hint">La démo varie la lumière et le cadrage d’une photo témoin selon tes réglages.</p>
          <fieldset disabled={busy || !ready}><legend>Format</legend><div className="formats">{formats.map(f => <label key={f}><input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} /><span>{f}</span></label>)}</div></fieldset>
          <div className="bill"><h3>Devis simulé</h3><dl>
            <div><dt>Fournisseur</dt><dd>{price ? money(price.providerCents) : '—'}</dd></div>
            <div><dt>Commission Esquisse</dt><dd>{price ? money(price.studioCents) : '—'}</dd></div>
            <div><dt>Taxes simulées</dt><dd>{price ? money(price.taxCents) : '—'}</dd></div>
            <div className="total"><dt>Total simulé</dt><dd>{price ? money(price.totalCents) : '—'}</dd></div>
          </dl></div>
          {error && <p className="error" role="alert">{error} <button type="button" className="text-button" onClick={() => { setError(''); setQuote(undefined); setReload(n => n + 1) }}>Actualiser le devis</button></p>}
          <button className="generate" disabled={!price || busy || !prompt.trim()}>{busy ? 'Simulation en cours…' : 'Générer une variation'} <span aria-hidden="true">↗</span></button>
          <p className="footnote">Aucun paiement · Débit réel {money(0)}</p>
          <span className="sr" role="status">{busy ? 'Simulation en cours' : receipt ? 'Image et reçu disponibles' : ''}</span>
        </form>
      </div>
    </main></>
}
