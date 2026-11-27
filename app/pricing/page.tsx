import { Navigation } from '../navigation'
import { fluxPrice, fluxProviderCents, models, trialFeeCents } from '../../lib/catalog'
import { money } from '../../lib/types'

export const metadata = {title:'Pricing · Esquisse'}
export default function Pricing() {
  return <><Navigation/><main className="workspace directory"><div className="page-head"><h1>Studio <em>Pricing</em></h1></div>
    <p className="pricing-intro">See the provider cost, the studio fee and what Esquisse collects per render.</p>
    <div className="table-box"><table><caption>Local prototype pricing</caption><thead><tr><th>Model or engine</th><th>Unit</th><th>Estimated provider cost</th><th>Collected by Esquisse</th></tr></thead>
      <tbody>{models.map(m=><tr key={m.id}><th scope="row"><a href={m.href}>{m.name} ↗</a></th><td>{m.unit}</td><td>{m.price}</td><td>{m.id === 'flux' ? '$0.00' : '€0.00'}</td></tr>)}</tbody></table></div>
    <section className="quote-example"><div><small>Sample quote · FLUX</small><h2>One square image</h2>
      <p>Your BFL account pays for the render. The quote includes a simulated studio fee.</p>
      <a className="quiet-link" href="/image?model=flux">Open the quote in the studio ↗</a></div>
      <dl><div><dt>Provider</dt><dd>{fluxPrice}</dd></div><div><dt>Simulated studio fee</dt><dd>{money(trialFeeCents,'USD')}</dd></div>
        <div className="total"><dt>Estimated total before tax</dt><dd>{money(fluxProviderCents + trialFeeCents,'USD')}</dd></div></dl></section>
  </main></>
}
