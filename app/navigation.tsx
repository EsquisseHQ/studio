'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { mediaNames, studies } from '../lib/catalog'

const sections = [
  ['/', 'Image'], ['/video', 'Vidéo'], ['/audio', 'Audio'], ['/models', 'Models'], ['/pricing', 'Pricing']
] as const

export function Navigation({imageMenu}: {imageMenu?: (close: () => void) => ReactNode}) {
  const path = usePathname()
  const [menu, setMenu] = useState('')
  const nav = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const close = () => setMenu('')
  useEffect(() => {
    if (!menu) return
    function outside(event: PointerEvent) {
      if (!nav.current?.contains(event.target as Node)) setMenu('')
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenu(''); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [menu])
  return <header className="mast"><div className="mast-inner">
    <a className="brand" href="/" aria-label="Esquisse, accueil"><img src="/esquisse-logo.png" alt="" /><span>esquisse</span></a>
    <nav aria-label="Navigation principale" ref={nav}>
      {sections.map(([href, label]) => {
        const active = href === path
        const isImage = href === '/' && Boolean(imageMenu)
        const hasMenu = isImage || ['/video','/audio','/models'].includes(href)
        const medium = href === '/video' ? 'video' : 'audio'
        const expanded = menu === href
        return <div className={'nav-item' + (active ? ' selected' : '')} key={href}>
          {!isImage && <a href={href} aria-current={active ? 'page' : undefined}>{label}</a>}
          {hasMenu && <button className={isImage ? 'image-trigger' : 'sub-trigger'} aria-label={isImage ? 'Image' : 'Menu ' + label}
            aria-expanded={expanded} aria-controls={expanded ? 'studio-menu' : undefined}
            onClick={e => {trigger.current = e.currentTarget; setMenu(expanded ? '' : href)}}>
            {isImage && 'Image'}<span className="chevron" /></button>}
          {expanded && <section id="studio-menu" className={'image-menu' + (href === '/models' ? ' directory-menu' : '')} aria-label={'Menu ' + label}>
            {isImage ? imageMenu?.(close) : href === '/models' ?
              <><a href="/models">Tous les modèles <span>{'↗'}</span></a><a href="/models?view=providers">Fournisseurs <span>↗</span></a><a href="/models?view=compare">Comparer <span>↗</span></a></> :
              <><div className="menu-tiles media-tiles">{studies[medium].slice(0,2).map(s =>
                <a key={s.id} href={href + '?study=' + s.id}><img src={'/studies/'+s.art+'.webp'} alt=""/><strong>{s.name} ↗</strong></a>)}</div>
                <div className="menu-columns media-columns"><div><h2>Outils</h2><a href={href}>Studio {mediaNames[medium]}</a><a href={href+'#export'}>{medium === 'video' ? 'Exporter un plan' : 'Exporter une boucle'}</a></div>
                  <div><h2>Catalogue</h2><a href={'/models?media='+medium}>{medium === 'video' ? 'Moteurs vidéo' : 'Moteurs audio'} ↗</a></div></div></>}
          </section>}
        </div>
      })}
      <a className="community" href="https://github.com/EsquisseHQ/studio/discussions">Communauté ↗</a>
    </nav><span className="local"><i />Studio local</span>
  </div></header>
}
