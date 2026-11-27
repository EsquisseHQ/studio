'use client'

import { useEffect, useRef } from 'react'
import { examplePrompt, money, type Receipt } from '../lib/types'

export type GalleryItem = { id: string; title: string; image: string; prompt: string; receipt?: Receipt }
const studies = [
  ['chrome', 'Liquid Chrome', 'A floating ribbon of chrome with lavender and copper reflections against a deep plum background.'],
  ['portrait', 'Backlit Portrait', 'An editorial portrait in profile against a tangerine backdrop, with silver jewelry and direct flash.'],
  ['concrete', 'Slanting Sun', 'Raw concrete architecture with an oval opening to the sky and geometric evening shadows.'],
  ['iris', 'Glass Iris', 'A macro shot of a dew-covered violet iris with translucent petals and a shallow depth of field.'],
  ['wave', 'Blue Tide', 'A teal wave at water level, silver foam at dusk and a hint of film grain.'],
  ['coupe', 'Final Turn', 'A white coupe in a tunnel, seen from a rear three-quarter angle with streaks of amber light.']
]
export const examples: GalleryItem[] = studies.map(([id, title, prompt]) => ({
  id, title, prompt, image: '/studies/' + id + '.webp'
})).concat([{ id: 'ambre', title: 'Amber Glass', prompt: examplePrompt, image: '/atelier.webp' }])

export function asset(kind: string, id: string, download = false) {
  return '/api/studio/' + kind + '?id=' + encodeURIComponent(id) + (download ? '&download=1' : '')
}
export function renderItem(receipt: Receipt): GalleryItem {
  return { id: receipt.id, title: receipt.prompt, prompt: receipt.prompt, image: asset('image', receipt.id), receipt }
}

export function GalleryCard({ item, open }: { item: GalleryItem; open: () => void }) {
  return <article className="tile">
    <button className="tile-open" onClick={open} aria-label={'Open ' + item.title}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span className="tile-caption"><small>{item.receipt?.model || 'Visual study'}</small><strong>{item.title}</strong></span>
    </button>
    {item.receipt && <a className="tile-download" aria-label="Download PNG" title="Download PNG" href={asset('image', item.id, true)} download>↓</a>}
  </article>
}

export function ImageDetails({ item, close, reuse, running }: {
  item: GalleryItem; close: () => void; reuse: () => void; running: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  const r = item.receipt
  return <dialog ref={ref} className="details" aria-labelledby="detail-title" onCancel={close}
    onClick={e => { if (e.target === ref.current) close() }}>
    <div className="detail-grid">
      <img className="detail-image" src={item.image} alt={item.title} />
      <div className="detail-copy">
        <div className="detail-top"><span>{r ? 'My renders' : 'Examples'}</span><button onClick={close} aria-label="Close">×</button></div>
        <h2 id="detail-title">{r ? r.model : item.title}</h2><h3>Description</h3><p>{item.prompt}</p>
        {r && <dl><div><dt>Dimensions</dt><dd>{r.width} × {r.height}</dd></div>
          <div><dt>{r.simulated ? 'Simulated quote' : 'Estimate before tax'}</dt><dd>{money(r.quote.totalCents, r.quote.currency)}</dd></div>
          <div><dt>Collected by Esquisse</dt><dd>{money(r.chargedCents, r.quote.currency)}</dd></div></dl>}
        <button className="primary-light" onClick={reuse} disabled={running}>{r ? 'Reuse settings' : 'Use this prompt'}</button>
        {r && <div className="file-links"><a href={asset('image', r.id, true)} download>Download PNG ↓</a><a href={asset('receipt', r.id, true)} download>JSON receipt ↓</a></div>}
      </div>
    </div>
  </dialog>
}
