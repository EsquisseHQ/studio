import { redirect } from 'next/navigation'
import { Navigation } from './navigation'
import { fluxProviderCents, trialFeeCents } from '../lib/catalog'
import { money } from '../lib/types'
import './home.css'

export const metadata = {
  title: 'Esquisse · Studio créatif à prix transparents',
  description: 'Explore les studios Image, Vidéo et Audio. Consulte le coût fournisseur et la commission Esquisse avant de générer.'
}

const studios = [
  {name: 'Image', href: '/image', image: 'portrait', action: 'Créer une image'},
  {name: 'Vidéo', href: '/video', image: 'coupe', action: 'Explorer les plans'},
  {name: 'Audio', href: '/audio', image: 'chrome', action: 'Écouter les boucles'}
]

export default async function Home({searchParams}: {searchParams: Promise<{model?: string}>}) {
  const {model} = await searchParams
  if (model === 'demo' || model === 'flux') redirect('/image?model=' + model)

  return <><Navigation /><main className="home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <a className="source-pill" href="https://github.com/EsquisseHQ/studio">Studio open source ↗</a>
        <h1 id="home-title">Crée en sachant<br />ce que tu paies.</h1>
        <p>Avant chaque génération d’image, ton devis détaille le coût du modèle et la commission d’Esquisse. Après le rendu, tu peux télécharger le reçu.</p>
        <div className="home-actions"><a className="primary-light" href="/image">Ouvrir le studio ↗</a><a href="#devis">Voir un devis ↓</a></div>
      </div>
    </section>
    <section id="devis" className="home-quote" aria-labelledby="quote-title">
      <div><small>Exemple de devis · FLUX 1.1 [pro]</small><h2 id="quote-title">Où va ton argent ?</h2>
        <p>Pour une image carrée, le coût prévu chez Black Forest Labs est de {money(fluxProviderCents, 'USD')}. La commission affichée est simulée dans le prototype. Esquisse encaisse {money(0, 'USD')}.</p>
        <a className="quiet-link" href="/pricing">Tous les tarifs ↗</a>
      </div>
      <dl>
        <div><dt>Coût fournisseur prévu</dt><dd>{money(fluxProviderCents, 'USD')}</dd></div>
        <div><dt>Commission simulée</dt><dd>{money(trialFeeCents, 'USD')}</dd></div>
        <div className="total"><dt>Total indicatif HT</dt><dd>{money(fluxProviderCents + trialFeeCents, 'USD')}</dd></div>
      </dl>
    </section>
    <section aria-labelledby="studios-title"><div className="home-section-head"><h2 id="studios-title">Les studios</h2><a className="quiet-link" href="/models">Comparer les modèles ↗</a></div>
      <div className="home-studios">{studios.map(s => <a key={s.href} href={s.href}><img src={'/studies/' + s.image + '.webp'} alt="" loading="lazy" />
        <span><small>{s.action}</small><strong>{s.name} ↗</strong></span></a>)}</div>
    </section>
  </main></>
}
