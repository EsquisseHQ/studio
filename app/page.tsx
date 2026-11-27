'use client'

import { useEffect, useRef, useState } from 'react'
import { examplePrompt, fluxRate, formats, money, type Format, type Outcome, type Quote, type Receipt } from '../lib/types'

const storageKey = 'esquisse.attempt.v1'
type Saved = { quoteId: string; prompt: string; format: Format; model?: 'demo' | 'flux' }
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
  const [model, setModel] = useState<'demo' | 'flux'>('demo')
  const live = model === 'flux'
  const [quote, setQuote] = useState<Quote & { missingKey?: boolean }>()
  const [receipt, setReceipt] = useState<Receipt>()
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [tracked, setTracked] = useState('')
  const [retryId, setRetryId] = useState('')
  const [progress, setProgress] = useState('')
  const lock = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved: Saved = JSON.parse(raw)
        setModel(saved.model || 'demo'); setFormat(saved.format); setPrompt(saved.prompt); setTracked(saved.quoteId)
      }
    } catch { setError('La sauvegarde locale est indisponible.') }
    setReady(true)
  }, [])
  useEffect(() => {
    if (!tracked) return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    let polls = 0
    async function check() {
      try {
        const result = await post<Outcome>('status', { quoteId: tracked })
        if (!active) return
        if ('state' in result) {
          setProgress(result.message)
          if (result.state === 'pending' && ++polls < 90) {
            timer = setTimeout(check, 1600)
            return
          }
          if (result.state === 'pending') setRetryId(tracked)
        } else {
          setReceipt(result); setProgress(''); setRetryId('')
        }
      } catch (err) {
        if (!active) return
        setProgress(''); setError(err instanceof Error ? err.message : 'Suivi interrompu.')
        setRetryId(tracked)
      }
      setTracked('')
    }
    void check()
    return () => { active = false; clearTimeout(timer) }
  }, [tracked])
  useEffect(() => {
    if (!ready) return
    let active = true
    setQuote(undefined)
    post<Quote & { missingKey?: boolean }>('quote', { format, model }).then(q => { if (active) setQuote(q) })
      .catch(() => { if (active) setError('Le devis est indisponible. Actualise le prix.') })
    return () => { active = false }
  }, [format, model, reload, ready])

  async function run() {
    if (lock.current || tracked || !price || price.missingKey || !prompt.trim()) return
    lock.current = true
    setBusy(true)
    setError('')
    setProgress(''); setRetryId('')
    const saved: Saved = { quoteId: price.id, prompt: prompt.trim(), format, model }
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved))
      const result = await post<Outcome>('generate', saved)
      if ('state' in result) {
        setProgress(result.message)
        if (result.state === 'pending') setTracked(result.id)
      } else { setReceipt(result) }
      setQuote(undefined)
      setReload(value => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : 'Essai interrompu.'); setRetryId(saved.quoteId) }
    finally { lock.current = false; setBusy(false) }
  }
  const price = quote?.format === format && (quote.rate === fluxRate) === live ? quote : undefined
  const running = busy || Boolean(tracked)
  const formatted = (cents: number) => money(cents, price?.currency)
  const dims = receipt ? receipt.width + ' × ' + receipt.height : '1024 × 1024'
  return <>
    <header><div className="bar"><a className="brand" href="/"><img src="/esquisse-logo.png" alt="" />Esquisse</a>
      <span className="section">Studio Image</span><a className="source" href="https://github.com/EsquisseHQ/studio">GitHub ↗</a></div></header>
    <main><div className="title"><div><p className="eyebrow">Atelier de création</p><h1>Studio Image</h1></div>
      <span className="mode"><i />{live ? 'API Black Forest Labs' : 'Simulation locale'}</span></div>
      <div className="workspace">
        <section className="canvas"><div className="canvas-head"><h2>{receipt ? 'Dernier rendu' : 'Aperçu du studio'}</h2><span>{dims} px</span></div>
          <div className="frame"><img className="photo" src={receipt ? asset('image', receipt.id) : '/atelier.webp'} alt={receipt ? receipt.prompt : 'Flacon de parfum ambré sur du travertin éclairé au soleil'} /></div>
          <div className="caption"><div><span className="eyebrow">{receipt ? receipt.model : 'Exemple de départ'}</span><h3>{receipt ? (receipt.simulated ? 'Variation de lumière' : 'Image générée') : 'Étude de verre ambré'}</h3></div>
            {receipt && <button className="text-button" disabled={running} onClick={() => { setPrompt(receipt.prompt); setFormat(receipt.quote.format); setModel(receipt.simulated ? 'demo' : 'flux'); input.current?.focus() }}>Reprendre les réglages ↗</button>}
          </div>
          {receipt && <div className="downloads"><a href={asset('image', receipt.id, true)} download>Télécharger le PNG ↓</a><a href={asset('receipt', receipt.id, true)} download>Reçu JSON ↓</a><span>Encaissé par Esquisse · {money(receipt.chargedCents, receipt.quote.currency)}</span></div>}
        </section>
        <form onSubmit={e => { e.preventDefault(); void run() }}>
          <h2>Composer</h2><div className="model"><label htmlFor="model">Modèle</label><select id="model" value={model} disabled={running || !ready} onChange={e => {
            const next = e.target.value === 'flux' ? 'flux' : 'demo'
            setModel(next); setError(''); setProgress('')
            if (next === 'flux') setFormat('1:1')
          }}><option value="demo">Esquisse Démo</option><option value="flux">FLUX 1.1 [pro]</option></select></div>
          <label htmlFor="prompt">Description</label><textarea ref={input} id="prompt" value={prompt} maxLength={2000} disabled={busy || !ready} onChange={e => setPrompt(e.target.value)} />
          <p className="hint">{live ? 'Une image carrée de 1024 × 1024 à partir de ta description.' : 'La démo varie la lumière et le cadrage d’une photo témoin selon tes réglages.'}</p>
          <fieldset disabled={running || !ready}><legend>Format</legend><div className="formats">{(live ? ['1:1'] as const : formats).map(f => <label key={f}><input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} /><span>{f}</span></label>)}</div></fieldset>
          <div className="bill"><h3>{live ? 'Devis du prototype · USD' : 'Devis simulé'}</h3><dl>
            <div><dt>{live ? 'BFL · coût fournisseur' : 'Fournisseur'}</dt><dd>{price ? formatted(price.providerCents) : '—'}</dd></div>
            <div><dt>{live ? 'Commission test · non encaissée' : 'Commission Esquisse'}</dt><dd>{price ? formatted(price.studioCents) : '—'}</dd></div>
            {!live && <div><dt>Taxes simulées</dt><dd>{price ? formatted(price.taxCents) : '—'}</dd></div>}
            <div className="total"><dt>{live ? 'Total indicatif HT' : 'Total simulé'}</dt><dd>{price ? formatted(price.totalCents) : '—'}</dd></div>
          </dl></div>
          {error && <p className="error" role="alert">{error} <button type="button" className="text-button" onClick={() => { setError(''); setQuote(undefined); setReload(n => n + 1) }}>Actualiser le devis</button></p>}
          {progress && <p role="status">{progress}</p>}
          {retryId && !running && <button type="button" onClick={() => { setError(''); setTracked(retryId); setRetryId('') }}>Vérifier le dernier essai</button>}
          {price?.missingKey && <p className="hint">Pour utiliser FLUX, configure BFL_API_KEY dans .env.local puis redémarre le studio.</p>}
          <button className="generate" disabled={!price || price.missingKey || running || !prompt.trim()}>{running ? 'Essai en cours…' : live ? 'Générer · 0,04 USD chez BFL' : 'Générer une variation'} <span aria-hidden="true">↗</span></button>
          <p className="footnote">{live ? 'Le compte associé à ta clé BFL finance cet essai. Esquisse encaisse 0 USD.' : 'Aucun paiement · Débit réel ' + money(0)}</p>
          <span className="sr" role="status">{busy ? 'Simulation en cours' : receipt ? 'Image et reçu disponibles' : ''}</span>
        </form>
      </div>
    </main></>
}
