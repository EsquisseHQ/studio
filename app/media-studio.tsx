import { Navigation } from './navigation'
import { mediaNames, studies } from '../lib/catalog'

export function MediaStudio({medium, selected}: {medium: 'audio' | 'video'; selected?: string}) {
  const video = medium === 'video'
  const list = studies[medium]
  const active = list.find(x => x.id === selected) || list[0]
  const ext = video ? 'mp4' : 'wav'
  const asset = '/media/'+active.id+'.'+ext
  const art = '/studies/'+active.art+'.webp'
  return <><Navigation/><main className="workspace">
    <div className="page-head"><h1>Studio <em>{mediaNames[medium]}</em></h1><a className="quiet-link" href={'/models?media='+medium}>Catalogue ↗</a></div>
    <div className="media-layout">
      <section className="screen">
        {video ? <video key={asset} controls playsInline poster={art} preload="metadata" aria-label={'Lire '+active.name} src={asset}/> :
          <div className="audio-stage" style={{backgroundImage:'linear-gradient(90deg,#100917ef,#10091760), url('+art+')'}}>
            <div className="record" style={{backgroundImage:'url('+art+')'}} aria-hidden="true"/>
            <div className="audio-track"><small>Étude sonore</small><h2>{active.name}</h2><p>{active.detail}</p>
            <audio key={asset} controls preload="metadata" aria-label={'Écouter '+active.name} src={asset}/></div>
          </div>}
        <div className="screen-caption"><div><small>{video ? active.detail : 'Synthèse instrumentale'}</small><h2>{active.name}</h2></div>
          <a id="export" className="primary-light" href={asset} download>Télécharger le {ext.toUpperCase()} ↓</a></div>
      </section>
      <aside className="sequence"><div className="list-head"><h2>{video ? 'Plans de caméra' : 'Boucles audio'}</h2><span>03</span></div>
        {list.map((s,i) => <a key={s.id} href={'/'+medium+'?study='+s.id} aria-current={s.id === active.id ? 'true' : undefined}>
          <img src={'/studies/'+s.art+'.webp'} alt=""/><div><small>0{i+1} / {video ? 'PLAN' : 'PISTE'}</small><strong>{s.name}</strong><span>{s.detail}</span></div>
          <b aria-hidden="true">▷</b></a>)}
      </aside>
    </div>
    <div className="session-info"><div><small>Moteur</small><strong>{video ? 'Études de mouvement' : 'Études sonores'}</strong></div>
      <div><small>Sortie</small><strong>{video ? 'MP4 · 768 × 432 · 24 i/s' : 'WAV · PCM 16 bits · mono'}</strong></div>
      <div><small>Coût par export</small><strong>Gratuit</strong></div></div>
    <p className="studio-note">{video ? 'Ces plans précomposés permettent de tester la lecture et l’export en local.' : 'Ces boucles de synthétiseur sont disponibles à l’écoute et au téléchargement en local.'}</p>
  </main></>
}
