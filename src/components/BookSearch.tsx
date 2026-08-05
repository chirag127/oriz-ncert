/**
 * BookSearch — search interface, used by /search/. Same data shape as
 * BookGrid but a list-results form rather than the card grid.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BookMetadata } from '~/lib/types'

function classNumber(c: string): number {
  const m = c.match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

export default function BookSearch() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<BookMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ class: '', subject: '', language: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initialQuery = new URL(window.location.href).searchParams.get('q') ?? ''
    setQuery(initialQuery)
    fetch('/data/metadata/books.json')
      .then((r) => r.json())
      .then((data: BookMetadata[]) => setBooks(data))
      .catch((err) => console.warn('Could not load books index', err))
      .finally(() => setLoading(false))
    inputRef.current?.focus()
  }, [])

  const subjects = useMemo(() => [...new Set(books.map((b) => b.subject))].sort(), [books])
  const classes = useMemo(
    () => [...new Set(books.map((b) => b.class))].sort((a, b) => classNumber(a) - classNumber(b)),
    [books],
  )
  const languages = useMemo(() => [...new Set(books.map((b) => b.language))].sort(), [books])

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return books
      .filter((book) => {
        if (filters.class && book.class !== filters.class) return false
        if (filters.subject && book.subject !== filters.subject) return false
        if (filters.language && book.language !== filters.language) return false
        if (terms.length === 0) return true
        const blob = [
          book.title,
          book.subject,
          book.class,
          book.bookCode,
          book.language,
          ...(book.keywords ?? []),
          ...(book.chapterNames ?? []),
          ...(book.chapters?.map((c) => c.name) ?? []),
          book.description ?? '',
        ]
          .join(' ')
          .toLowerCase()
        return terms.every((t) => blob.includes(t))
      })
      .sort((a, b) => {
        const ca = classNumber(a.class)
        const cb = classNumber(b.class)
        if (ca !== cb) return ca - cb
        return a.title.localeCompare(b.title)
      })
  }, [books, query, filters])

  return (
    <div className="bs-root">
      <div className="bs-input-wrap">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, subject, chapter, keyword…"
          data-cycle-placeholder
          className="bs-input"
        />
      </div>

      <div className="bs-filters mono">
        <select
          value={filters.class}
          onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c.replace('class-', 'Class ')}
            </option>
          ))}
        </select>
        <select
          value={filters.subject}
          onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          value={filters.language}
          onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
        >
          <option value="">All media</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <p className="bs-meta mono">
        {loading
          ? 'LOADING CATALOGUE…'
          : `${results.length} ${results.length === 1 ? 'BOOK' : 'BOOKS'} MATCHED`}
      </p>

      <ol className="bs-results">
        {results.map((book) => (
          <li key={book.bookCode}>
            <a href={`/book/${book.bookCode}/`}>
              <span className="r-code mono">{book.bookCode.toUpperCase()}</span>
              <span className="r-title">{book.title}</span>
              <span className="r-meta mono">
                {book.class.replace('class-', 'CL ').toUpperCase()} ·{' '}
                {book.subject.replace(/-/g, ' ').toUpperCase()} · {book.language.toUpperCase()}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <style>{`
        .bs-root { padding-block: 1.5rem 4rem; }

        .bs-input-wrap { margin-bottom: 1rem; }
        .bs-input {
          width: 100%;
          height: 52px;
          padding-inline: 1rem;
          background: var(--paper-2);
          color: var(--ink);
          border: 1px solid var(--rule-line);
          border-bottom: 2px solid var(--blue);
          border-radius: 0;
          font-family: var(--font-body);
          font-size: 1.05rem;
        }
        .bs-input::placeholder { color: var(--mist); }
        .bs-input:focus { outline: none; border-bottom-color: var(--marker); }

        .bs-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .bs-filters select {
          height: 34px;
          padding-inline: 0.625rem;
          background: var(--paper);
          color: var(--ink);
          border: 1px solid var(--rule-line);
          border-radius: 0;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .bs-filters select:hover { border-color: var(--blue); }
        .bs-filters select:focus { outline: none; border-color: var(--blue); }

        .bs-meta {
          margin: 1rem 0;
          color: var(--mist);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .bs-results {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid var(--rule-line);
        }
        .bs-results li { margin: 0; }
        .bs-results a {
          display: grid;
          grid-template-columns: 6rem 1fr auto;
          gap: 1rem;
          align-items: baseline;
          padding: 0.8rem 0.5rem;
          color: var(--ink);
          text-decoration: none;
          border-bottom: 1px solid var(--rule-line);
          border-left: 2px solid transparent;
        }
        .bs-results a:hover {
          background: var(--paper-2);
          border-left-color: var(--marker);
        }
        .r-code {
          color: var(--mist);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
        }
        .r-title {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.3;
          color: var(--ink);
        }
        .r-meta {
          color: var(--mist);
          font-family: var(--font-mono);
          font-size: 0.66rem;
          letter-spacing: 0.06em;
          text-align: right;
        }
        @media (max-width: 640px) {
          .bs-results a { grid-template-columns: 1fr; gap: 0.25rem; }
          .r-meta { text-align: left; }
        }
      `}</style>
    </div>
  )
}
