import type { Metadata } from 'next'
import './studio.css'
import './workspace.css'

export const metadata: Metadata = { title: 'Image Studio · Esquisse', description: 'Image, video and audio studios, model catalog and pricing.' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
