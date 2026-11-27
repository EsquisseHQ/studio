import { money } from './types'

export const fluxProviderCents = 4
export const trialFeeCents = 1
export const fluxPrice = money(fluxProviderCents, 'USD')
export const mediaNames = {image: 'Image', video: 'Video', audio: 'Audio'} as const
export type Medium = keyof typeof mediaNames

export const models = [
  {id: 'demo', name: 'Esquisse Demo', medium: 'image', provider: 'Esquisse', mode: 'Simulator', description: 'Explore lighting and framing variations on a perfume photograph.', output: 'PNG', unit: 'image', price: 'Free', href: '/image?model=demo', art: '/atelier.webp'},
  {id: 'flux', name: 'FLUX 1.1 [pro]', medium: 'image', provider: 'Black Forest Labs', mode: 'API · BFL key', description: 'Generate a square image from a text prompt.', output: 'PNG', unit: 'image', price: fluxPrice, href: '/image?model=flux', art: '/studies/portrait.webp'},
  {id: 'motion', name: 'Motion Studies', medium: 'video', provider: 'Esquisse', mode: 'Local studies', description: 'Preview and export precomposed camera shots.', output: 'MP4', unit: 'shot', price: 'Free', href: '/video', art: '/studies/coupe.webp'},
  {id: 'sound', name: 'Sound Studies', medium: 'audio', provider: 'Esquisse', mode: 'Local studies', description: 'Listen to synth loops and download them as WAV files.', output: 'WAV', unit: 'loop', price: 'Free', href: '/audio', art: '/studies/chrome.webp'}
] as const
export type CatalogEntry = typeof models[number]
export const studies = {
  video: [
    {id:'coupe', name:'Final Turn', detail:'Tracking shot', art:'coupe'},
    {id:'concrete', name:'Vanishing Point', detail:'Zoom in', art:'concrete'},
    {id:'wave', name:'At Water Level', detail:'Zoom out', art:'wave'}
  ],
  audio: [
    {id:'pulse', name:'Analog Midnight', detail:'Pulse · 120 BPM', art:'chrome'},
    {id:'glass', name:'Frosted Glass', detail:'Chimes · 90 BPM', art:'iris'},
    {id:'tide', name:'Slow Tide', detail:'Ambient pad · 60 BPM', art:'wave'}
  ]
} as const
