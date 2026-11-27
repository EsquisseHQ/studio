'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { mediaNames, studies } from '../lib/catalog'

const sections = [
  ['/', 'Home'], ['/image', 'Image'], ['/video', 'Video'], ['/audio', 'Audio'], ['/models', 'Models'],
  ['/pricing', 'Pricing'], ['/mcp', 'MCP']
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
    <a className="brand" href="/" aria-label="Esquisse home"><img src="/esquisse-logo.png" alt="" /><span>esquisse</span></a>
    <nav aria-label="Main navigation" ref={nav}>
      {sections.map(([href, label]) => {
        const active = href === path
        const isImage = href === '/image' && Boolean(imageMenu)
        const hasMenu = isImage || ['/video','/audio','/models'].includes(href)
        const medium = href === '/video' ? 'video' : 'audio'
        const expanded = menu === href
        return <div className={'nav-item' + (active ? ' selected' : '')} key={href}>
          {!isImage && <a href={href} aria-current={active ? 'page' : undefined}>{label}</a>}
          {hasMenu && <button className={isImage ? 'image-trigger' : 'sub-trigger'} aria-label={isImage ? 'Image' : label + ' menu'}
            aria-expanded={expanded} aria-controls={expanded ? 'studio-menu' : undefined}
            onClick={e => {trigger.current = e.currentTarget; setMenu(expanded ? '' : href)}}>
            {isImage && 'Image'}<span className="chevron" /></button>}
          {expanded && <section id="studio-menu" className={'image-menu' + (href === '/models' ? ' directory-menu' : '')} aria-label={label + ' menu'}>
            {isImage ? imageMenu?.(close) : href === '/models' ?
              <><a href="/models">All models <span>{'↗'}</span></a><a href="/models?view=providers">Providers <span>↗</span></a><a href="/models?view=compare">Compare <span>↗</span></a></> :
              <><div className="menu-tiles media-tiles">{studies[medium].slice(0,2).map(s =>
                <a key={s.id} href={href + '?study=' + s.id}><img src={'/studies/'+s.art+'.webp'} alt=""/><strong>{s.name} ↗</strong></a>)}</div>
                <div className="menu-columns media-columns"><div><h2>Tools</h2><a href={href}>{mediaNames[medium]} Studio</a><a href={href+'#export'}>{medium === 'video' ? 'Export a shot' : 'Export a loop'}</a></div>
                  <div><h2>Catalog</h2><a href={'/models?media='+medium}>{medium === 'video' ? 'Video engines' : 'Audio engines'} ↗</a></div></div></>}
          </section>}
        </div>
      })}
      <a className="community" href="https://github.com/EsquisseHQ/studio/discussions">Community ↗</a>
    </nav><span className="local"><i />Local studio</span>
  </div></header>
}
