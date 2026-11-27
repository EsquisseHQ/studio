import { Navigation } from '../navigation'
import { fluxPrice, fluxProviderCents, models, trialFeeCents } from '../../lib/catalog'
import { money } from '../../lib/types'

export const metadata = {title:'Pricing · Esquisse'}
export default function Pricing() {
  return <><Navigation/><main className="workspace directory"><div className="page-head"><h1>Studio <em>Pricing</em></h1></div>
    <p className="pricing-intro">Le coût par rendu, la part du fournisseur et la commission d’Esquisse.</p>
    <div className="table-box"><table><caption>Tarifs du prototype local</caption><thead><tr><th>Modèle ou moteur</th><th>Unité</th><th>Coût fournisseur prévu</th><th>Encaissé par Esquisse</th></tr></thead>
      <tbody>{models.map(m=><tr key={m.id}><th scope="row"><a href={m.href}>{m.name} ↗</a></th><td>{m.unit}</td><td>{m.price}</td><td>{m.id === 'flux' ? '0,00 USD' : '0,00 €'}</td></tr>)}</tbody></table></div>
    <section className="quote-example"><div><small>Exemple de devis · FLUX</small><h2>Une image carrée</h2>
      <p>Ton compte BFL finance le rendu. Dans cette version, la commission apparaît sur le devis à titre indicatif.</p>
      <a className="quiet-link" href="/image?model=flux">Ouvrir le devis dans le studio ↗</a></div>
      <dl><div><dt>Fournisseur</dt><dd>{fluxPrice}</dd></div><div><dt>Commission test</dt><dd>{money(trialFeeCents,'USD')}</dd></div>
        <div className="total"><dt>Total indicatif HT</dt><dd>{money(fluxProviderCents + trialFeeCents,'USD')}</dd></div></dl></section>
  </main></>
}
