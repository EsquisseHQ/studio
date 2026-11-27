import { Navigation } from '../navigation'

export const metadata = { title: 'MCP · Esquisse' }

export default function McpPage() {
  return <>
    <Navigation />
    <main className="workspace directory">
      <div className="page-head"><h1>Studio <em>MCP</em></h1></div>
      <p className="pricing-intro">La connexion des agents au studio via le Model Context Protocol est en projet.</p>
      <a className="quiet-link" href="https://github.com/EsquisseHQ/studio/discussions">Proposer un outil pour les agents ↗</a>
    </main>
  </>
}
