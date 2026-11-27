import { MediaStudio } from '../media-studio'
export const metadata = {title:'Studio Audio · Esquisse'}
export default async function Page({searchParams}: {searchParams: Promise<{study?: string}>}) {
  return <MediaStudio medium="audio" selected={(await searchParams).study}/>
}
