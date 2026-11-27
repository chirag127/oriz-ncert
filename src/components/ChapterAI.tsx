/**
 * ChapterAI — optional, client-only AI study aid for a book.
 *
 * Two actions over the selected chapter title:
 *   • "explain simpler" — a plain-language ELI5 of what the chapter covers.
 *   • "practice questions" — a short set of practice questions.
 *
 * No key: routes through @chirag127/oz-ai (g4f multi-provider failover).
 * Fully optional — if every provider fails, the whole panel hides itself.
 * Lazy: mounted client:visible so it adds no first-paint JS.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import { complete } from '@chirag127/oz-ai'

interface Props {
  bookTitle: string
  className: string
  subject: string
  chapters: string[]
}

type Mode = 'explain' | 'practice'

const SYSTEM =
  'You are an NCERT study tutor for Indian school students. Be clear, accurate, and encouraging. Use plain language. No markdown headings, no preamble.'

function prompt(mode: Mode, book: string, cls: string, subject: string, chapter: string): string {
  const ctx = `Book: ${book} (${cls}, ${subject}). Chapter: "${chapter}".`
  return mode === 'explain'
    ? `${ctx} Explain this chapter's core ideas simply, as if to a younger student. 4-6 short sentences. Everyday examples where useful.`
    : `${ctx} Write 5 practice questions covering this chapter's likely key ideas. Mix recall and application. Number them 1-5. Questions only, no answers.`
}

export default function ChapterAI({ bookTitle, className, subject, chapters }: Props) {
  const list = useMemo(() => chapters.filter(Boolean), [chapters])
  const [chapter, setChapter] = useState(list[0] ?? '')
  const [mode, setMode] = useState<Mode>('explain')
  const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false)
  const [dead, setDead] = useState(false)
  const abort = useRef<AbortController | null>(null)

  const run = useCallback(
    async (m: Mode) => {
      if (busy || !chapter) return
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      setMode(m)
      setBusy(true)
      setOut('')
      try {
        const res = await complete(prompt(m, bookTitle, className, subject, chapter), {
          system: SYSTEM,
          signal: ctrl.signal,
          temperature: 0.5,
        })
        if (!ctrl.signal.aborted) setOut(res.trim())
      } catch {
        setDead(true)
      } finally {
        if (!ctrl.signal.aborted) setBusy(false)
      }
    },
    [busy, chapter, bookTitle, className, subject],
  )

  if (dead || list.length === 0) return null

  return (
    <section className="cai" aria-label="AI study aid">
      <p className="cai-eyebrow">AI study aid · optional · no sign-in</p>
      <div className="cai-row">
        <label className="cai-field">
          <span className="cai-label">Chapter</span>
          <select
            className="cai-select"
            value={chapter}
            onChange={(e) => {
              setChapter(e.target.value)
              setOut('')
            }}
            disabled={busy}
          >
            {list.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div className="cai-actions">
          <button
            type="button"
            className="cai-btn"
            onClick={() => run('explain')}
            disabled={busy}
          >
            {busy && mode === 'explain' ? 'thinking…' : 'explain simpler'}
          </button>
          <button
            type="button"
            className="cai-btn"
            onClick={() => run('practice')}
            disabled={busy}
          >
            {busy && mode === 'practice' ? 'thinking…' : 'practice questions'}
          </button>
        </div>
      </div>
      {(busy || out) && (
        <output className="cai-out">{busy ? 'chalking it out…' : out}</output>
      )}
      <p className="cai-note">AI-generated. Verify against the textbook.</p>

      <style>{`
        .cai {
          margin-top: 2.5rem;
          background: var(--board);
          color: var(--chalk);
          border: 1px solid var(--board-2);
          border-radius: 4px;
          padding: 1.25rem 1.25rem 1rem;
        }
        .cai-eyebrow {
          margin: 0 0 0.9rem;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--chalk-dim);
        }
        .cai-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          align-items: flex-end;
        }
        .cai-field { display: flex; flex-direction: column; gap: 0.35rem; flex: 1 1 220px; }
        .cai-label {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--chalk-dim);
        }
        .cai-select {
          appearance: none;
          background: var(--board-2);
          color: var(--chalk);
          border: 1px solid var(--chalk-dim);
          border-radius: 3px;
          padding: 0.5rem 0.6rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          max-width: 100%;
        }
        .cai-select:focus-visible { outline: 2px solid var(--ochre); outline-offset: 1px; }
        .cai-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .cai-btn {
          background: transparent;
          color: var(--ochre);
          border: 1px solid var(--ochre);
          border-radius: 3px;
          padding: 0.5rem 0.85rem;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: lowercase;
          cursor: pointer;
          transition: background 120ms linear, color 120ms linear;
        }
        .cai-btn:hover:not(:disabled) { background: var(--ochre); color: var(--board); }
        .cai-btn:disabled { opacity: 0.55; cursor: default; }
        .cai-out {
          display: block;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed var(--chalk-dim);
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.7;
          white-space: pre-wrap;
          color: var(--chalk);
        }
        .cai-note {
          margin: 0.9rem 0 0;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--chalk-dim);
        }
      `}</style>
    </section>
  )
}
