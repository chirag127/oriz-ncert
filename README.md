# Oriz NCERT

> Free NCERT textbook directory — browse, search, and download every NCERT book by class, subject, and language.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/chirag127/oriz-ncert?style=social)](https://github.com/chirag127/oriz-ncert/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/chirag127/oriz-ncert)](https://github.com/chirag127/oriz-ncert/commits)
[![Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE.svg?logo=astro&logoColor=white)](https://astro.build)
[![CI](https://github.com/chirag127/oriz-ncert/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/oriz-ncert/actions/workflows/ci.yml)

## What it is / why it exists

Finding a specific NCERT textbook on the official portal is slow and fiddly. **Oriz NCERT** is a fast, searchable catalogue of the full NCERT textbook list — filter by class, subject, and language, then jump straight to the chapter or whole-book PDF. Nothing is re-hosted: every PDF link points directly at `ncert.nic.in`, so this is a thin, respectful index over the official source.

- **Live site**: <https://ncert.oriz.in>
- **Repo**: <https://github.com/chirag127/oriz-ncert>
- **Landing (GH Pages)**: <https://chirag127.github.io/oriz-ncert/>

⭐ If this is useful, please **star the repo** — it helps others find it.

## How it works

```mermaid
flowchart LR
    D[(books.json<br/>+ metadata)] --> B[Astro build<br/>SSG]
    B --> P1[/ catalogue/]
    B --> P2[book/[bookCode]]
    B --> P3[/search/]
    B --> PWA[PWA + sitemap]
    P1 & P2 & P3 --> CF[Cloudflare<br/>static assets]
    CF --> U([Reader])
    U -->|download PDF| NIC[ncert.nic.in]
    U -.->|optional sign-in| CLK[Clerk SSO<br/>*.oriz.in]
    CLK -.->|bookmarks| FS[(Firestore)]
```

## Features

- **Full catalogue** — every NCERT book, grouped by class / subject / language.
- **Per-book detail pages** at `book/[bookCode]` with chapter-wise and whole-book PDF links.
- **Client-side search** at `/search` over the pre-built index.
- **Direct-to-source PDFs** — links resolve to `ncert.nic.in`; zero re-hosting, zero copyright overhead.
- **Installable PWA** — offline shell, autoupdate, maskable icons.
- **Optional sign-in** (Clerk) for cross-device bookmarks synced to Firestore — public content reads with no auth.
- **SEO-ready** — sitemap, robots, legal pages baked in.

## Tech stack

- **Astro 6** static site generation
- **React 19** islands for interactive components (search, book detail, account)
- **Tailwind CSS 4** via the Vite plugin
- **@vite-pwa/astro** for the installable PWA
- **Clerk** (`@clerk/clerk-react`) shared `*.oriz.in` SSO, optional
- **Firebase / Firestore** for bookmark sync
- **`@chirag127/oz-ai`** keyless AI helper (optional chapter assist)
- **Cloudflare** static hosting via **Wrangler**
- Tooling: **Biome**, **Vitest**, **Playwright**

## Repo structure

```text
oriz-ncert/
├── src/
│   ├── pages/                 # routes: /, /search, /browse, book/[bookCode], [class]/[subject]/[lang], legal/*
│   ├── components/            # BookGrid, BookSearch, BookDetail, SaveBook, ChapterAI, Header, Footer …
│   ├── layouts/BaseLayout.astro
│   ├── lib/                   # books.ts, catalog.ts, firebase.ts, siteConfig.ts, types.ts
│   └── styles/                # tokens.css, global.css, ui-overrides.css
├── data/                      # books.json (67 books) + metadata + search-index
├── public/                    # favicon, icons, data
├── astro.config.mjs           # Astro + React + sitemap + PWA config
├── wrangler.toml              # Cloudflare deploy → ncert.oriz.in
└── tests/                     # smoke + e2e (Playwright)
```

## Screenshots

_Screenshots coming soon._ In the meantime, see the live site: <https://ncert.oriz.in>

## Quick start

Requires Node `>=22.12` and pnpm.

```bash
git clone https://github.com/chirag127/oriz-ncert
cd oriz-ncert
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # → dist/
pnpm preview        # serve the build locally
```

> On **Windows**, build with npm instead — pnpm skips the `@esbuild/win32-x64` optional binary and Astro build crashes. Use `npm install --legacy-peer-deps && npm run build`.

### Deploy (Cloudflare)

```bash
pnpm build
wrangler deploy     # publishes dist/ → ncert.oriz.in
```

The custom domain `ncert.oriz.in` is bound to the `oriz-ncert` project via the Cloudflare dashboard.

## Configuration

Optional — public content works with zero configuration. These only enable sign-in / bookmark sync.

| Env var | Purpose |
|---|---|
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client-side publishable key (shared `*.oriz.in` SSO). Never expose the secret key. |
| `PUBLIC_FIREBASE_*` | Firebase web config used by Firestore bookmark sync. |
| `PUBLIC_BASE_PATH` | Base path override for the site (defaults to `/`). |

See `.env.example` for the full family-wide set.

## Cost

**$0 on the Cloudflare free tier.** Static assets, no server, PDFs served straight from `ncert.nic.in`.

## Part of the oriz family

One of ~80 sites in the **oriz** family — small, single-purpose, free tools. See the blog at <https://blog.oriz.in>.

## Contributing

Issues and PRs welcome. Conventional commits, `main` only. Run `pnpm lint && pnpm test` before pushing.

## License

MIT © Chirag Singhal — see [LICENSE](LICENSE).

## Author

Chirag Singhal · <chirag@oriz.in>

## Status

**Production** — live at ncert.oriz.in. Bookmark→Firestore sync is WIP; a metadata-refresh scraper is planned.

_Conventional commits are the changelog._
