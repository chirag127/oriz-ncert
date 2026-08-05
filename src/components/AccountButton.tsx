/*
 * AccountButton — header Clerk island. Signed-out: a quiet "Sign in" pill.
 * Signed-in: the Clerk UserButton. PUBLIC content is never gated by this; it
 * only unlocks the personal shelf (Firestore). Renders nothing without a key.
 */
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { withClerk } from './clerk'

export default function AccountButton() {
  return withClerk(
    <span className="acct">
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="acct-btn">Sign in</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{ elements: { avatarBox: { width: 30, height: 30 } } }}
        />
      </SignedIn>
      <style>{`
        .acct { display: inline-flex; align-items: center; }
        .acct-btn {
          appearance: none;
          background: transparent;
          border: 1px solid var(--rule-line);
          color: var(--ink);
          font-family: var(--font-mono);
          font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
          padding: .4rem .75rem; cursor: pointer; border-radius: 0;
          transition: border-color .12s, color .12s;
        }
        .acct-btn:hover { border-color: var(--blue); color: var(--blue); }
      `}</style>
    </span>,
  )
}
