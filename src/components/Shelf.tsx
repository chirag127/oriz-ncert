/*
 * Board — THE SIGNATURE. A school blackboard on which the reader chalks in
 * their pick: Class → Subject → Language, written as chalk lines, with the
 * chosen book "chalked in" on the right and an Open-book tick.
 *
 * One orchestrated motion moment: on load the chalk lines dust in from faint to
 * solid (staggered). Reduced-motion → instant, fully legible.
 *
 * Data comes from data/books.json (passed as `entries`). Routing contract is
 * unchanged: Open book links to /{class}/{subject}/{lang}/.
 */
import { useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'hi'
interface Entry { class: string; subject: string; lang: Lang; title: string; pdf_url: string }
interface Props {
  entries: Entry[]
  classes: string[]
  classLabel: Record<string, string>
  subjectLabel: Record<string, string>
}

const DISCIPLINE: Record<string, string> = {
  math: 'maths', science: 'science', physics: 'science', chemistry: 'science', biology: 'science',
  english: 'lang', hindi: 'lang', evs: 'science', rimjhim: 'early',
  'social-science': 'social', history: 'social', geography: 'social', economics: 'social',
  'political-science': 'social', sociology: 'social', psychology: 'social',
  accountancy: 'social', 'business-studies': 'social',
}
const subVar = (subject: string) => `var(--sub-${DISCIPLINE[subject] ?? 'social'})`

export default function Board({ entries, classes, classLabel, subjectLabel }: Props) {
  const [cls, setCls] = useState<string | null>(null)
  const [subject, setSubject] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const subjects = useMemo(() => {
    if (!cls) return [] as string[]
    return [...new Set(entries.filter((e) => e.class === cls).map((e) => e.subject))]
  }, [cls, entries])

  const langs = useMemo(() => {
    if (!cls || !subject) return [] as Lang[]
    const s = new Set<Lang>()
    for (const e of entries) if (e.class === cls && e.subject === subject) s.add(e.lang)
    return [...s]
  }, [cls, subject, entries])

  const chosen = useMemo(() => {
    if (!cls || !subject || !lang) return null
    return entries.find((e) => e.class === cls && e.subject === subject && e.lang === lang) ?? null
  }, [cls, subject, lang, entries])

  const target = chosen ? `/${cls}/${subject}/${lang}/` : null

  const pickClass = (c: string) => { setCls(c); setSubject(null); setLang(null) }
  const pickSubject = (s: string) => { setSubject(s); setLang(null) }

  return (
    <section className={`board ${mounted ? 'is-in' : ''}`} aria-label="Chalk in your book">
      <div className="board-frame">
        <div className="board-surface">
          <span className="board-hook board-hook--l" aria-hidden="true" />
          <span className="board-hook board-hook--r" aria-hidden="true" />

          {/* Line 1 — Class */}
          <fieldset className="line" style={{ ['--d' as string]: '0ms' }}>
            <legend className="line-key">Class</legend>
            <div className="chalks" role="group" aria-label="Class">
              {classes.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chalk ${cls === c ? 'chalk--on' : ''}`}
                  aria-pressed={cls === c}
                  onClick={() => pickClass(c)}
                >
                  {c === 'pre-primary' ? 'Pre-K' : c}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Line 2 — Subject */}
          <fieldset className={`line ${cls ? '' : 'line--wait'}`} style={{ ['--d' as string]: '90ms' }}>
            <legend className="line-key">Subject</legend>
            <div className="chalks" role="group" aria-label="Subject">
              {!cls && <span className="line-hint">— pick a class first</span>}
              {cls && subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chalk ${subject === s ? 'chalk--on' : ''}`}
                  style={{ ['--sc' as string]: subVar(s) }}
                  aria-pressed={subject === s}
                  onClick={() => pickSubject(s)}
                >
                  {subjectLabel[s] ?? s}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Line 3 — Language */}
          <fieldset className={`line ${subject ? '' : 'line--wait'}`} style={{ ['--d' as string]: '180ms' }}>
            <legend className="line-key">Language</legend>
            <div className="chalks" role="group" aria-label="Language">
              {!subject && <span className="line-hint">— then a subject</span>}
              {subject && langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`chalk ${lang === l ? 'chalk--on' : ''}`}
                  aria-pressed={lang === l}
                  onClick={() => setLang(l)}
                  lang={l}
                >
                  {l === 'hi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>
          </fieldset>

          {/* The chalked-in result */}
          <div className="result" aria-live="polite">
            {chosen ? (
              <>
                <p className="result-title">{chosen.title}</p>
                <a className="result-open" href={target ?? '#'}>Open this book →</a>
              </>
            ) : (
              <p className="result-blank">
                {cls
                  ? subject
                    ? 'pick a language'
                    : `${classLabel[cls]} — pick a subject`
                  : 'Chalk in a class, subject, and language.'}
              </p>
            )}
          </div>
        </div>
        <div className="board-tray" aria-hidden="true">
          <span className="tray-chalk tray-chalk--a" />
          <span className="tray-chalk tray-chalk--b" />
        </div>
      </div>

      <style>{`
        .board { margin-top: clamp(1.5rem, 4vw, 2.5rem); }
        .board-frame {
          background: linear-gradient(#8a5a2b, #6d451f);
          padding: 14px 14px 0;
          border-radius: 8px;
          box-shadow: 0 18px 40px color-mix(in oklab, var(--ink) 30%, transparent),
            inset 0 2px 0 rgba(255,255,255,.14), inset 0 -2px 0 rgba(0,0,0,.3);
        }
        .board-surface {
          position: relative;
          background:
            radial-gradient(120% 90% at 30% 10%, color-mix(in oklab, var(--board-2) 80%, transparent), transparent 60%),
            var(--board);
          border-radius: 3px;
          padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2.75rem) clamp(1.75rem, 4vw, 2.5rem);
          box-shadow: inset 0 0 60px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04);
          overflow: hidden;
        }
        /* faint chalk-smear texture */
        .board-surface::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(60% 40% at 78% 22%, color-mix(in oklab, var(--chalk) 7%, transparent), transparent 70%),
            radial-gradient(50% 40% at 12% 80%, color-mix(in oklab, var(--chalk) 5%, transparent), transparent 70%);
          opacity: .8;
        }
        .board-hook { position: absolute; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: #d9c28b; box-shadow: 0 1px 1px rgba(0,0,0,.4); }
        .board-hook--l { left: 14px; }
        .board-hook--r { right: 14px; }

        .line {
          position: relative; z-index: 1;
          border: 0; margin: 0; padding: 0 0 1.1rem;
          display: block; width: 100%; min-inline-size: 0; box-sizing: border-box;
          opacity: 0; transform: translateY(4px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .board.is-in .line { opacity: 1; transform: none; transition-delay: var(--d, 0ms); }
        .line--wait { opacity: .42; }
        .board.is-in .line--wait { opacity: .42; }
        .line-key {
          display: block; float: none;
          font-family: var(--font-mono); font-size: .7rem; letter-spacing: .18em;
          text-transform: uppercase; color: var(--chalk-dim);
          padding: 0; margin-bottom: .5rem;
        }
        .chalks { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; min-height: 34px; width: 100%; }
        .line-hint { font-family: var(--font-mono); font-size: .82rem; color: var(--chalk-dim); font-style: italic; }

        .chalk {
          appearance: none; cursor: pointer;
          background: transparent; color: var(--chalk);
          border: 1px dashed color-mix(in oklab, var(--chalk) 32%, transparent);
          border-radius: 3px;
          padding: .35rem .7rem; min-width: 2.4rem;
          font-family: var(--font-display); font-weight: 500; font-size: 1rem; line-height: 1.1;
          transition: color .12s, border-color .12s, background .12s, box-shadow .12s;
          text-shadow: 0 0 6px rgba(238,242,234,.25);
          text-align: center;
        }
        .chalk:hover { border-color: var(--ochre); color: var(--ochre); }
        .chalk--on {
          color: var(--board); background: var(--ochre);
          border: 1px solid var(--ochre); text-shadow: none; font-weight: 600;
          box-shadow: 0 0 14px color-mix(in oklab, var(--ochre) 55%, transparent);
        }
        .chalk--on:hover { color: var(--board); }
        /* subject chalks tint their underline colour when active */
        .line:nth-of-type(2) .chalk--on {
          background: var(--sc, var(--ochre)); border-color: var(--sc, var(--ochre));
          box-shadow: 0 0 14px color-mix(in oklab, var(--sc, var(--ochre)) 55%, transparent);
          color: #fff;
        }

        .result {
          position: relative; z-index: 1;
          margin-top: .35rem; padding-top: 1.1rem;
          border-top: 1px solid color-mix(in oklab, var(--chalk) 18%, transparent);
          min-height: 3rem;
          display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .5rem 1.5rem;
        }
        .result-title {
          margin: 0; color: var(--chalk); font-family: var(--font-display); font-weight: 600;
          font-size: clamp(1.15rem, 3vw, 1.6rem); letter-spacing: -0.01em;
          text-shadow: 0 0 8px rgba(238,242,234,.2);
        }
        .result-open {
          font-family: var(--font-mono); font-size: .82rem; letter-spacing: .06em;
          color: var(--board); background: var(--ochre);
          padding: .6rem 1.1rem; border-radius: 3px; text-decoration: none; white-space: nowrap;
          box-shadow: 0 0 16px color-mix(in oklab, var(--ochre) 45%, transparent);
        }
        .result-open:hover { background: #fff; }
        .result-blank { margin: 0; color: var(--chalk-dim); font-family: var(--font-mono); font-size: .9rem; font-style: italic; }

        .board-tray {
          position: relative; height: 14px;
          background: linear-gradient(#5a3a1a, #43290f);
          border-radius: 0 0 6px 6px;
          box-shadow: inset 0 2px 3px rgba(0,0,0,.4);
        }
        .tray-chalk { position: absolute; bottom: 5px; height: 6px; border-radius: 3px; background: var(--chalk); opacity: .85; }
        .tray-chalk--a { left: 22px; width: 40px; }
        .tray-chalk--b { left: 70px; width: 26px; background: var(--ochre); opacity: .9; }

        @media (prefers-reduced-motion: reduce) {
          .board .line { opacity: 1; transform: none; transition: none; }
          .board .line--wait { opacity: .42; }
        }
      `}</style>
    </section>
  )
}
