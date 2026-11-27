import type { Metadata } from 'next'
import './studio.css'
import './workspace.css'

export const metadata: Metadata = { title: 'Studio Image · Esquisse', description: 'Studios Image, Vidéo et Audio, catalogue et tarifs Esquisse.' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>
}
