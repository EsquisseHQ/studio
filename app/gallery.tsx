'use client'

import { useEffect, useRef } from 'react'
import { examplePrompt, money, type Receipt } from '../lib/types'

export type GalleryItem = { id: string; title: string; image: string; prompt: string; receipt?: Receipt }
const studies = [
  ['chrome', 'Chrome liquide', 'Un ruban de chrome en suspension. Reflets lavande et cuivre sur un fond prune profond.'],
  ['portrait', 'Contre-jour', 'Portrait éditorial de profil sur fond mandarine, bijoux argentés et lumière au flash.'],
  ['concrete', 'Soleil oblique', 'Architecture en béton brut, ouverture ovale sur le ciel et ombres géométriques du soir.'],
  ['iris', 'Iris de verre', 'Macro d’un iris violet couvert de rosée, pétales translucides et profondeur de champ courte.'],
  ['wave', 'Marée bleue', 'Une vague bleu pétrole à hauteur d’eau, écume argentée au crépuscule et grain argentique.'],
  ['coupe', 'Dernier virage', 'Un coupé blanc dans un tunnel, vu de trois quarts arrière. Filets de lumière ambrée.']
]
export const examples: GalleryItem[] = studies.map(([id, title, prompt]) => ({
  id, title, prompt, image: '/studies/' + id + '.webp'
})).concat([{ id: 'ambre', title: 'Verre ambré', prompt: examplePrompt, image: '/atelier.webp' }])

export function asset(kind: string, id: string, download = false) {
  return '/api/studio/' + kind + '?id=' + encodeURIComponent(id) + (download ? '&download=1' : '')
}
export function renderItem(receipt: Receipt): GalleryItem {
  return { id: receipt.id, title: receipt.prompt, prompt: receipt.prompt, image: asset('image', receipt.id), receipt }
}

export function GalleryCard({ item, open }: { item: GalleryItem; open: () => void }) {
  return <article className="tile">
    <button className="tile-open" onClick={open} aria-label={'Ouvrir ' + item.title}>
      <img src={item.image} alt={item.title} loading="lazy" />
      <span className="tile-caption"><small>{item.receipt?.model || 'Étude visuelle'}</small><strong>{item.title}</strong></span>
    </button>
    {item.receipt && <a className="tile-download" aria-label="Télécharger le PNG" title="Télécharger le PNG" href={asset('image', item.id, true)} download>↓</a>}
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
        <div className="detail-top"><span>{r ? 'Mes rendus' : 'Exemples'}</span><button onClick={close} aria-label="Fermer">×</button></div>
        <h2 id="detail-title">{r ? r.model : item.title}</h2><h3>Description</h3><p>{item.prompt}</p>
        {r && <dl><div><dt>Dimensions</dt><dd>{r.width} × {r.height}</dd></div>
          <div><dt>Devis {r.simulated ? 'simulé' : 'indicatif HT'}</dt><dd>{money(r.quote.totalCents, r.quote.currency)}</dd></div>
          <div><dt>Encaissé par Esquisse</dt><dd>{money(r.chargedCents, r.quote.currency)}</dd></div></dl>}
        <button className="primary-light" onClick={reuse} disabled={running}>{r ? 'Reprendre les réglages' : 'Utiliser le prompt'} ↗</button>
        {r && <div className="file-links"><a href={asset('image', r.id, true)} download>Télécharger le PNG ↓</a><a href={asset('receipt', r.id, true)} download>Reçu JSON ↓</a></div>}
      </div>
    </div>
  </dialog>
}
