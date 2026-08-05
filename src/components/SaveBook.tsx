/*
 * SaveBook — book-page Clerk+Firestore island. PUBLIC download is never gated
 * (the download button is plain Astro HTML). This only adds an optional
 * "Save to my shelf" for signed-in readers, persisted to Firestore keyed by
 * Clerk user id. Signed-out → a prompt to sign in. No key → renders nothing.
 */
import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react'
import { withClerk } from './clerk'
import { loadShelf, saveShelf } from '~/lib/firebase'

function SaveInner({ bookKey, title }: { bookKey: string; title: string }) {
  const { user } = useUser()
  const [saved, setSaved] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const on = saved.includes(bookKey)

  useEffect(() => {
    if (!user) return
    loadShelf(user.id).then(setSaved).catch(() => {})
  }, [user])

  async function toggle() {
    if (!user || busy) return
    setBusy(true)
    const next = on ? saved.filter((k) => k !== bookKey) : [...saved, bookKey]
    setSaved(next)
    try { await saveShelf(user.id, next) } catch { setSaved(saved) }
    setBusy(false)
  }

  return (
    <button type="button" className={`save-btn ${on ? 'save-btn--on' : ''}`} onClick={toggle} disabled={busy} aria-pressed={on}>
      {on ? 'On your shelf' : 'Save to my shelf'}
    </button>
  )
}

export default function SaveBook({ bookKey, title }: { bookKey: string; title: string }) {
  return withClerk(
    <div className="save-wrap">
      <SignedIn>
        <SaveInner bookKey={bookKey} title={title} />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="save-btn">Sign in to save this book</button>
        </SignInButton>
      </SignedOut>
      <style>{`
        .save-wrap { display: inline-flex; }
        .save-btn {
          appearance: none;
          background: transparent;
          border: 1px solid var(--rule-line);
          color: var(--ink);
          font-family: var(--font-mono); font-size: .74rem; letter-spacing: .08em;
          text-transform: uppercase; padding: .7rem 1.25rem; cursor: pointer; border-radius: 0;
          transition: border-color .12s, color .12s, background .12s;
        }
        .save-btn:hover { border-color: var(--blue); color: var(--blue); }
        .save-btn--on { background: var(--blue); border-color: var(--blue); color: #fff; }
        .save-btn--on:hover { color: #fff; }
        .save-btn:disabled { opacity: .6; cursor: default; }
      `}</style>
    </div>,
  )
}
