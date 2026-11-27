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
        <h1 id="home-title">Know the price<br /><span>before you create.</span></h1>
        <p>See the model cost and studio fee before you generate.</p>
        <a className="hero-open" href="/image">Open Studio</a>
      </div>
      <div className="glass-form" aria-hidden="true"><img src="/esquisse-glass.webp" alt="" fetchPriority="high" /></div>
    </section>

    <section className="studio-shelf" aria-labelledby="studios-title">
      <div className="home-section-head"><h2 id="studios-title">Explore the studios</h2>
        <a className="quiet-link" href="/models">Compare models</a></div>
      <div className="home-studios">{studios.map(s =>
        <article key={s.href}>
          <a className="studio-cover" href={s.href}>
            <img src={'/studies/' + s.image + '.webp'} alt="" loading="lazy" />
            <span className="cover-label"><small>{s.action}</small><strong>{s.name}</strong></span>
          </a>
          {s.href === '/image' && <section id="devis" className="sample-quote" aria-labelledby="quote-title">
            <div className="quote-head"><h3 id="quote-title">Sample quote</h3><small>FLUX 1.1 [pro] · 1 image</small></div>
            <dl>
              <div><dt>Estimated provider cost</dt><dd>{money(fluxProviderCents, 'USD')}</dd></div>
              <div><dt>Simulated studio fee</dt><dd>{money(trialFeeCents, 'USD')}</dd></div>
              <div className="quote-total"><dt>Estimated total before tax</dt><dd>{money(fluxProviderCents + trialFeeCents, 'USD')}</dd></div>
            </dl>
            <div className="quote-foot"><small>Esquisse collects {money(0, 'USD')} in this prototype.</small><a href="/pricing">Pricing</a></div>
          </section>}
        </article>
      )}</div>
    </section>
  </main></>
}
