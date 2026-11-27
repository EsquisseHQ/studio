import { Navigation } from '../navigation'

export const metadata = { title: 'MCP · Esquisse' }

export default function McpPage() {
  return <>
    <Navigation />
    <main className="workspace directory">
      <div className="page-head"><h1><em>MCP</em> for agents</h1></div>
      <p className="pricing-intro">Support for connecting agents to the studio through the Model Context Protocol is planned.</p>
      <a className="quiet-link" href="https://github.com/EsquisseHQ/studio/discussions">Suggest an agent tool ↗</a>
    </main>
  </>
}
