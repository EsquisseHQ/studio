'use client'

import { useEffect, useRef, useState } from 'react'
import { examplePrompt, fluxRate, formats, money, type Format, type Outcome, type Quote, type Receipt } from '../../lib/types'
import { Navigation } from '../navigation'
import { fluxPrice } from '../../lib/catalog'
import { examples, GalleryCard, ImageDetails, renderItem, type GalleryItem } from '../gallery'

const storageKey = 'esquisse.attempt.v1'
type Saved = { quoteId: string; prompt: string; format: Format; model?: 'demo' | 'flux' }
async function post<T>(action: string, data: unknown): Promise<T> {
  const res = await fetch('/api/studio/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Connexion interrompue.')
  return body
}
const historyPrefix = 'esquisse.gallery.v1.'
type Filter = 'all' | 'mine' | 'examples'
function recentFirst(a: Receipt, b: Receipt) { return b.createdAt.localeCompare(a.createdAt) }

export default function Studio() {
  const [prompt, setPrompt] = useState(examplePrompt)
  const [format, setFormat] = useState<Format>('1:1')
  const [model, setModel] = useState<'demo' | 'flux'>('demo')
  const live = model === 'flux'
  const [quote, setQuote] = useState<Quote & { missingKey?: boolean }>()
  const [history, setHistory] = useState<Receipt[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [dense, setDense] = useState(false)
  const [detail, setDetail] = useState<GalleryItem>()
  const pricePanel = useRef<HTMLDetailsElement>(null)
  const [reload, setReload] = useState(0)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [tracked, setTracked] = useState('')
  const [retryId, setRetryId] = useState('')
  const [progress, setProgress] = useState('')
  const lock = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)

  function remember(result: Receipt) {
    setHistory(items => [result, ...items.filter(r => r.id !== result.id)].sort(recentFirst))
    try { localStorage.setItem(historyPrefix + result.id, JSON.stringify(result)) }
    catch { setError('Stockage du navigateur plein. Télécharge le PNG pour conserver ce rendu.') }
  }
  useEffect(() => {
    function sync() {
      const items: Receipt[] = []
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith(historyPrefix)) continue
        try {
          const r = JSON.parse(localStorage.getItem(key) || 'null')
          if (r?.id && r.quote && typeof r.prompt === 'string' && typeof r.createdAt === 'string') items.push(r)
        } catch { continue }
      }
      setHistory(items.sort(recentFirst))
    }
    function onStorage(e: StorageEvent) { if (!e.key || e.key.startsWith(historyPrefix)) sync() }
    try { sync() } catch { setError('Historique local indisponible.') }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved: Saved = JSON.parse(raw)
        setModel(saved.model || 'demo'); setFormat(saved.format); setPrompt(saved.prompt); setTracked(saved.quoteId)
      }
    } catch { setError('La sauvegarde locale est indisponible.') }
    const requested = new URLSearchParams(window.location.search).get('model')
    if (requested === 'demo' || requested === 'flux') {
      setModel(requested)
      if (requested === 'flux') setFormat('1:1')
    }
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
          remember(result); setProgress(''); setRetryId('')
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
    setFilter(f => f === 'examples' ? 'all' : f)
    window.scrollTo({ top: 0 })
    setError('')
    setProgress(''); setRetryId('')
    const saved: Saved = { quoteId: price.id, prompt: prompt.trim(), format, model }
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved))
      const result = await post<Outcome>('generate', saved)
      if ('state' in result) {
        setProgress(result.message)
        if (result.state === 'pending') setTracked(result.id)
      } else { remember(result) }
      setQuote(undefined)
      setReload(value => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : 'Essai interrompu.'); setRetryId(saved.quoteId) }
    finally { lock.current = false; setBusy(false) }
  }
  const price = quote?.format === format && (quote.rate === fluxRate) === live ? quote : undefined
  const running = busy || Boolean(tracked)
  const formatted = (cents: number) => money(cents, price?.currency)
  function chooseModel(next: 'demo' | 'flux') {
    setModel(next); setError(''); setProgress('')
    if (next === 'flux') setFormat('1:1')
  }
  function navigate(next: Filter) {
    setFilter(next); window.scrollTo({ top: 0 })
  }
  const cards: GalleryItem[] = [
    ...(filter === 'examples' ? [] : history.map(renderItem)),
    ...(filter === 'mine' ? [] : examples)
  ]
  return <>
    <Navigation imageMenu={close => <>
          <div className="menu-tiles">
            <button onClick={() => { close(); input.current?.focus() }}><img src={examples[0].image} alt="" /><strong>Créer une image ↗</strong></button>
            <button onClick={() => { close(); navigate('examples') }}><img src={examples[1].image} alt="" /><strong>Explorer les exemples ↗</strong></button>
          </div>
          <div className="menu-columns"><div><h2>Outils</h2>
            <button onClick={() => { close(); navigate('mine') }}>Galerie de rendus</button>
            <button onClick={() => { close(); if (pricePanel.current) { pricePanel.current.open = true; pricePanel.current.querySelector('summary')?.focus() } }}>Détail du devis</button>
          </div><div><h2>Modèles</h2>
            <button disabled={running} onClick={() => { close(); chooseModel('demo') } }>Esquisse Démo <small>Local · gratuit</small></button>
            <button disabled={running} onClick={() => { close(); chooseModel('flux') } }>FLUX 1.1 [pro] <small>API · {fluxPrice}</small></button>
          </div></div>
    </>} />
    <main><div className="page-head"><h1>Studio <em>Image</em></h1>
      <div className="view-switch" role="group" aria-label="Densité de la galerie">
        <button aria-label="Grille confortable" title="Grille confortable" aria-pressed={!dense} onClick={() => setDense(false)}><i className="grid-icon" /></button>
        <button aria-label="Grille compacte" title="Grille compacte" aria-pressed={dense} onClick={() => setDense(true)}><i className="grid-icon compact" /></button>
      </div></div>
      <div className="gallery-bar"><div className="filters" role="group" aria-label="Filtrer la galerie">
        {([['all','Tout'],['mine','Mes rendus'],['examples','Exemples']] as const).map(([id,label]) =>
          <button key={id} aria-pressed={filter === id} onClick={() => navigate(id)}>{label}{id === 'mine' && history.length > 0 && <span> {history.length}</span>}</button>)}
      </div><span className="count">{cards.length} {cards.length === 1 ? 'image' : 'images'}</span></div>
      <section className={'gallery' + (dense ? ' dense' : '')} aria-label="Galerie d’images">
        {running && filter !== 'examples' && <div className="queue-tile" role="status"><i /><strong>Génération en cours</strong><span>{live ? 'FLUX 1.1 [pro]' : 'Esquisse Démo'}</span></div>}
        {cards.map(item => <GalleryCard key={item.id} item={item} open={() => setDetail(item)} />)}
      </section>
      {!cards.length && !running && <div className="empty"><h2>Ton premier rendu apparaîtra ici.</h2><button onClick={() => input.current?.focus()}>Écrire un prompt ↗</button></div>}
    </main>
    <form className="dock" onSubmit={e => { e.preventDefault(); void run() }}>
      <div className="prompt-row"><span className="spark" aria-hidden="true">✧</span><textarea ref={input} id="prompt" aria-label="Description"
        value={prompt} maxLength={2000} disabled={running || !ready} onChange={e => setPrompt(e.target.value)}
        placeholder="Décris l’image que tu veux créer…"/></div>
      <div className="dock-tools"><div className="select-shell"><span aria-hidden="true">◈</span>
        <select aria-label="Modèle" value={model} disabled={running || !ready} onChange={e => chooseModel(e.target.value === 'flux' ? 'flux' : 'demo')}>
          <option value="demo">Esquisse Démo</option><option value="flux">FLUX 1.1 [pro]</option></select></div>
        <div className="select-shell"><i className="ratio-icon" /><select aria-label="Format" value={format} disabled={running || !ready} onChange={e => setFormat(e.target.value as Format)}>
          {(live ? ['1:1'] as const : formats).map(f => <option key={f}>{f}</option>)}</select></div>
        <details ref={pricePanel} className="price"><summary aria-label="Détail du prix">Devis {price ? formatted(price.totalCents) : '…'} <span className="chevron" /></summary>
          <div className="price-body"><strong>{live ? 'Devis indicatif HT · USD' : 'Devis simulé'}</strong>
            <dl><div><dt>Fournisseur</dt><dd>{price ? formatted(price.providerCents) : '—'}</dd></div>
              <div><dt>Commission {live ? 'test' : 'Esquisse'}</dt><dd>{price ? formatted(price.studioCents) : '—'}</dd></div>
              {!live && <div><dt>Taxes simulées</dt><dd>{price ? formatted(price.taxCents) : '—'}</dd></div>}
              <div className="total"><dt>Total {live ? 'indicatif HT' : 'simulé'}</dt><dd>{price ? formatted(price.totalCents) : '—'}</dd></div></dl>
            <small>{live ? 'Ton compte BFL finance la génération. Esquisse encaisse 0 USD.' : 'Simulation sur la photo de parfum. Aucun débit.'}</small>
          </div></details>
        <button className="generate" disabled={!price || price.missingKey || running || !prompt.trim()}>
          <span>{running ? 'En cours…' : 'Générer'}</span><b>{live ? fluxPrice : 'Gratuit'}</b><span aria-hidden="true">↗</span>
        </button>
      </div>
      {error && <p className="notice" role="alert">{error} <button type="button" onClick={() => { setError(''); setQuote(undefined); setReload(n => n + 1) }}>Actualiser le devis</button></p>}
      {progress && <p className="notice" role="status">{progress}</p>}
      {retryId && !running && <button type="button" className="notice" onClick={() => { setError(''); setTracked(retryId); setRetryId('') }}>Vérifier le dernier essai</button>}
      {price?.missingKey && <p className="notice">FLUX nécessite une clé BFL_API_KEY dans .env.local. Esquisse Démo est disponible gratuitement.</p>}
    </form>
    {detail && <ImageDetails item={detail} close={() => setDetail(undefined)} running={running} reuse={() => {
      const r = detail.receipt
      if (r) { chooseModel(r.simulated ? 'demo' : 'flux'); setFormat(r.quote.format) }
      setPrompt(detail.prompt); setDetail(undefined); requestAnimationFrame(() => input.current?.focus())
    }} />}
  </>
}
