import { MediaStudio } from '../media-studio'
export const metadata = {title:'Video Studio · Esquisse'}
export default async function Page({searchParams}: {searchParams: Promise<{study?: string}>}) {
  return <MediaStudio medium="video" selected={(await searchParams).study}/>
}
