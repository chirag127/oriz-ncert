/*
 * clerk.tsx — shared Clerk wrapper for islands. Reads the publishable key from
 * PUBLIC_CLERK_PUBLISHABLE_KEY (never hardcoded). Cross-subdomain SSO across
 * *.oriz.in is Clerk's default when the instance is configured for the parent
 * domain, so no per-site domain wiring needed here.
 *
 * When the key is absent (local dev without secrets) islands render nothing —
 * PUBLIC content is served by Astro regardless, so auth is purely additive.
 */
import { ClerkProvider } from '@clerk/clerk-react'
import type { ReactNode } from 'react'

const PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined

export function hasClerk() {
  return Boolean(PUBLISHABLE_KEY)
}

export function withClerk(children: ReactNode) {
  if (!PUBLISHABLE_KEY) return null
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}
