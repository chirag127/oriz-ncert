interface SiteConfig {
  slug: string
  name: string
  origin: string
  tagline: string
  description?: string
}

export const SITE_CONFIG: SiteConfig = {
  slug: 'ncert',
  name: 'oriz · ncert',
  origin: 'https://oriz-ncert.pages.dev',
  tagline: 'chalk in the book you need',
  description:
    'Free NCERT textbooks — every class, subject, and language as one whole-book PDF. Chalk in a class and subject, then open straight from the official ncert.nic.in chapter files. No ads, no sign-in to read.',
}
