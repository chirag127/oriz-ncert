/**
 * firebase.ts — Firestore-only client for the shared oriz-in project.
 * Init from PUBLIC_FIREBASE_* env (never hardcoded). Auth is Clerk's job, not
 * Firebase's — we use Firestore purely to persist small per-user data keyed by
 * the Clerk user id (bookshelf / recently-downloaded).
 *
 * Returns null when env is unset (local dev without secrets) so islands
 * degrade to signed-in-but-no-persistence instead of throwing.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
}

let db: Firestore | null = null

export function getDb(): Firestore | null {
  if (db) return db
  if (!cfg.apiKey || !cfg.projectId) return null
  const app: FirebaseApp = getApps()[0] ?? initializeApp(cfg)
  db = getFirestore(app)
  return db
}

/** Firestore path for a user's ncert shelf, keyed by Clerk user id. */
const shelfRef = (fs: Firestore, uid: string) => doc(fs, 'ncert_shelves', uid)

export interface Shelf {
  saved: string[] // book keys like "10/science/en"
  updatedAt?: unknown
}

export async function loadShelf(uid: string): Promise<string[]> {
  const fs = getDb()
  if (!fs) return []
  const snap = await getDoc(shelfRef(fs, uid))
  return (snap.exists() ? (snap.data() as Shelf).saved : []) ?? []
}

export async function saveShelf(uid: string, saved: string[]): Promise<void> {
  const fs = getDb()
  if (!fs) return
  await setDoc(shelfRef(fs, uid), { saved, updatedAt: serverTimestamp() })
}
