export const fluxProviderCents = 4
export const trialFeeCents = 1
export const fluxPrice = (fluxProviderCents / 100).toLocaleString('fr-FR', {minimumFractionDigits: 2}) + ' USD'
export const mediaNames = {image: 'Image', video: 'Vidéo', audio: 'Audio'} as const
export type Medium = keyof typeof mediaNames

export const models = [
  {id: 'demo', name: 'Esquisse Démo', medium: 'image', provider: 'Esquisse', mode: 'Simulateur', description: 'Variations de lumière et de cadrage sur une photo de parfum.', output: 'PNG', unit: 'image', price: 'Gratuit', href: '/?model=demo', art: '/atelier.webp'},
  {id: 'flux', name: 'FLUX 1.1 [pro]', medium: 'image', provider: 'Black Forest Labs', mode: 'API · clé BFL', description: 'Génération d’une image carrée à partir d’un prompt.', output: 'PNG', unit: 'image', price: fluxPrice, href: '/?model=flux', art: '/studies/portrait.webp'},
  {id: 'motion', name: 'Études de mouvement', medium: 'video', provider: 'Esquisse', mode: 'Études locales', description: 'Plans de caméra précomposés à explorer et exporter.', output: 'MP4', unit: 'plan', price: 'Gratuit', href: '/video', art: '/studies/coupe.webp'},
  {id: 'sound', name: 'Études sonores', medium: 'audio', provider: 'Esquisse', mode: 'Études locales', description: 'Boucles de synthétiseur à écouter et télécharger.', output: 'WAV', unit: 'boucle', price: 'Gratuit', href: '/audio', art: '/studies/chrome.webp'}
] as const
export type CatalogEntry = typeof models[number]
export const studies = {
  video: [
    {id:'coupe', name:'Dernier virage', detail:'Travelling latéral', art:'coupe'},
    {id:'concrete', name:'Ligne de fuite', detail:'Zoom avant', art:'concrete'},
    {id:'wave', name:'À fleur d’eau', detail:'Zoom arrière', art:'wave'}
  ],
  audio: [
    {id:'pulse', name:'Minuit analogique', detail:'Pulsation · 120 BPM', art:'chrome'},
    {id:'glass', name:'Verre dépoli', detail:'Carillon · 90 BPM', art:'iris'},
    {id:'tide', name:'Marée lente', detail:'Nappe · 60 BPM', art:'wave'}
  ]
} as const
