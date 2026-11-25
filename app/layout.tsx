import type { Metadata } from 'next'
import './studio.css'

export const metadata: Metadata = { title: 'Studio Image · Esquisse', description: 'Atelier local de création d’images Esquisse.' }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>
}
