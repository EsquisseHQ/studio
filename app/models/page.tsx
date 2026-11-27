import { Navigation } from '../navigation'
import { Catalog } from './catalog'
export const metadata = {title:'Models · Esquisse'}
export default async function Page({searchParams}: {searchParams: Promise<{view?: string; media?: string}>}) {
  const params = await searchParams
  return <><Navigation/><main className="workspace directory">
    <div className="page-head"><h1>Model <em>Catalog</em></h1><a className="quiet-link" href="/pricing">View pricing</a></div>
    <Catalog view={params.view || ''} initialMedia={params.media || ''}/>
  </main></>
}
