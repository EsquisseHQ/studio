import { redirect } from 'next/navigation'
import { Navigation } from './navigation'
import { fluxProviderCents, trialFeeCents } from '../lib/catalog'
import { money } from '../lib/types'
import './home.css'

export const metadata = {
  title: 'Esquisse · Creative studio with transparent pricing',
  description: 'Explore the image, video and audio studios. See the provider cost and Esquisse fee before you generate.'
}

const studios = [
  {name: 'Image', href: '/image', image: 'portrait', action: 'Create an image'},
  {name: 'Video', href: '/video', image: 'coupe', action: 'Explore shots'},
  {name: 'Audio', href: '/audio', image: 'chrome', action: 'Listen to loops'}
]

export default async function Home({searchParams}: {searchParams: Promise<{model?: string}>}) {
  const {model} = await searchParams
  if (model === 'demo' || model === 'flux') redirect('/image?model=' + model)

  return <><Navigation /><main className="home">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <a className="source-pill" href="https://github.com/EsquisseHQ/studio">Open-source studio ↗</a>
        <h1 id="home-title">Know the price<br />before you create.</h1>
        <p>See the provider cost and Esquisse fee before you generate an image. Download an itemized receipt when your render is ready.</p>
        <div className="home-actions"><a className="primary-light" href="/image">Open the studio ↗</a><a href="#devis">See a sample quote ↓</a></div>
      </div>
    </section>
    <section id="devis" className="home-quote" aria-labelledby="quote-title">
      <div><small>Sample quote · FLUX 1.1 [pro]</small><h2 id="quote-title">Where does your money go?</h2>
        <p>Black Forest Labs’ estimated price for one square image is {money(fluxProviderCents, 'USD')}. The studio fee is simulated in this prototype. Esquisse collects {money(0, 'USD')}.</p>
        <a className="quiet-link" href="/pricing">View pricing ↗</a>
      </div>
      <dl>
        <div><dt>Estimated provider cost</dt><dd>{money(fluxProviderCents, 'USD')}</dd></div>
        <div><dt>Simulated studio fee</dt><dd>{money(trialFeeCents, 'USD')}</dd></div>
        <div className="total"><dt>Estimated total before tax</dt><dd>{money(fluxProviderCents + trialFeeCents, 'USD')}</dd></div>
      </dl>
    </section>
    <section aria-labelledby="studios-title"><div className="home-section-head"><h2 id="studios-title">Explore the studios</h2><a className="quiet-link" href="/models">Compare models ↗</a></div>
      <div className="home-studios">{studios.map(s => <a key={s.href} href={s.href}><img src={'/studies/' + s.image + '.webp'} alt="" loading="lazy" />
        <span><small>{s.action}</small><strong>{s.name} ↗</strong></span></a>)}</div>
    </section>
  </main></>
}
