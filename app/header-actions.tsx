'use client'

import { useEffect, useRef, useState } from 'react'

const profileKey = 'esquisse.profile.name'

export function HeaderActions() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    try { setName(localStorage.getItem(profileKey) || '') } catch { /* Storage may be disabled. */ }
  }, [])

  function openAccount() {
    setDraft(name)
    setError('')
    dialog.current?.showModal()
  }

  return <div className="header-actions">
    <a href="/pricing" className="upgrade-action">Upgrade</a>
    <a href="/image?view=mine" className="folder-action" aria-label="My renders" title="My renders">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1H3zM3 12h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
    </a>
    <button type="button" className="account-action" aria-label="Account" title="Account" aria-haspopup="dialog" onClick={openAccount}>
      {name ? Array.from(name)[0].toUpperCase() : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>}
    </button>
    <dialog ref={dialog} className="profile-dialog" aria-labelledby="profile-title" onClick={e => { if (e.target === dialog.current) dialog.current.close() }}>
      <form onSubmit={e => {
        e.preventDefault()
        const next = draft.trim()
        try {
          localStorage.setItem(profileKey, next)
          setName(next)
          dialog.current?.close()
        } catch { setError('Your browser could not save this profile.') }
      }}>
        <div className="profile-title"><h2 id="profile-title">Your profile</h2><button type="button" aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div>
        <label htmlFor="display-name">Display name</label>
        <input id="display-name" value={draft} onChange={e => setDraft(e.target.value)} maxLength={48} autoComplete="nickname" />
        <small>Saved in this browser.</small>
        {error && <p role="alert">{error}</p>}
        <button className="primary-light">Save profile</button>
      </form>
    </dialog>
  </div>
}
