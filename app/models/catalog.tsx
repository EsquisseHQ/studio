'use client'

import { useState } from 'react'
import { mediaNames, models, type CatalogEntry, type Medium } from '../../lib/catalog'

function Card({item}: {item: CatalogEntry}) {
  return <article className="model-card"><a className="model-art" href={item.href} aria-label={'Ouvrir '+item.name}><img alt="" src={item.art}/></a>
    <div className="model-copy"><small>{mediaNames[item.medium]} / {item.provider}</small><h2><a href={item.href}>{item.name}</a></h2>
      <p>{item.description}</p><div className="model-foot"><span>{item.mode}</span><strong>{item.price}</strong></div></div></article>
}
function Comparison() {
  const [left, setLeft] = useState('demo')
  const [right, setRight] = useState('flux')
  const items = [left,right].map(id => models.find(item => item.id === id)!)
  const fields = ['Usage','Fournisseur','Accès','Sortie','Coût fournisseur'] as const
  const values = (item: CatalogEntry) => [mediaNames[item.medium], item.provider, item.mode, item.output, item.price+' / '+item.unit]
  return <div className="table-box"><table><caption className="sr-only">Comparaison de deux moteurs</caption><thead><tr><th>Comparer</th>
    {items.map((m,i) => <th key={i}><select aria-label={'Modèle '+(i+1)} value={m.id} onChange={e => (i === 0 ? setLeft : setRight)(e.target.value)}>
      {models.map(item => <option key={item.id} value={item.id} disabled={item.id === items[1-i].id}>{item.name}</option>)}</select></th>)}</tr></thead>
    <tbody>{fields.map((f,i) => <tr key={f}><th scope="row">{f}</th>{items.map(item => <td key={item.id}>{values(item)[i]}</td>)}</tr>)}
    <tr><th scope="row">Studio</th>{items.map(item => <td key={item.id}><a className="quiet-link" href={item.href}>Ouvrir ↗</a></td>)}</tr></tbody></table></div>
}
export function Catalog({view, initialMedia}: {view:string; initialMedia:string}) {
  const [media, setMedia] = useState(initialMedia)
  const [query, setQuery] = useState('')
  const visible = models.filter(item => (!media || !(media in mediaNames) || item.medium === media) &&
    (item.name+' '+item.provider+' '+mediaNames[item.medium]).toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')))
  const current = ['providers','compare'].includes(view) ? view : ''
  return <><nav className="section-tabs" aria-label="Parcourir le catalogue">
    {[['','Tous les modèles'],['providers','Fournisseurs'],['compare','Comparer']].map(([id,label]) => <a key={id} aria-current={current === id ? 'page' : undefined} href={id ? '/models?view='+id : '/models'}>{label}</a>)}</nav>
    {current === 'compare' ? <Comparison/> : current === 'providers' ?
      <div className="provider-list">{Array.from(new Set(models.map(m=>m.provider))).map(p => <section key={p}><h2>{p}</h2>
        {models.filter(m=>m.provider===p).map(m=><a key={m.id} href={m.href}>{m.name}<small>{m.mode} ↗</small></a>)}</section>)}</div> :
      <><div className="catalog-tools"><div className="filters" role="group" aria-label="Type de média">
        <button aria-pressed={!media || !(media in mediaNames)} onClick={()=>setMedia('')}>Tout</button>
        {(Object.keys(mediaNames) as Medium[]).map(key=><button key={key} aria-pressed={media===key} onClick={()=>setMedia(key)}>{mediaNames[key]}</button>)}</div>
        <input type="search" value={query} aria-label="Rechercher un modèle ou un fournisseur" placeholder="Rechercher un modèle, un fournisseur…" onChange={e=>setQuery(e.target.value)}/></div>
      <div className="model-grid">{visible.map(item=><Card item={item} key={item.id}/>)}</div>
      {!visible.length && <p className="studio-note" role="status">Aucun résultat pour cette recherche.</p>}</>}
  </>
}
