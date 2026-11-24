import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs', () => ({ default: { readFileSync: vi.fn() } }))

import fs from 'node:fs'

const entry = {
  class: '6',
  subject: 'social-science',
  lang: 'en',
  title: 'Social Science',
  pdf_url: 'https://example.com/book.pdf',
}

describe('NCERT catalog', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.mocked(fs.readFileSync).mockReset()
  })

  it('loads book records and caches the parsed catalog', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify([entry]))
    const { loadCatalog } = await import('../lib/catalog')
    const catalog = loadCatalog()
    expect(catalog).toEqual([entry])
    expect(loadCatalog()).toBe(catalog)
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringMatching(/data[/\\]books\.json$/),
      'utf-8',
    )
  })

  it('returns an empty catalog when the data file is unavailable', async () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT')
    })
    const { loadCatalog } = await import('../lib/catalog')
    expect(loadCatalog()).toEqual([])
    expect(loadCatalog()).toEqual([])
    expect(fs.readFileSync).toHaveBeenCalledTimes(1)
  })

  it('returns an empty catalog for invalid JSON', async () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{broken')
    const { loadCatalog } = await import('../lib/catalog')
    expect(loadCatalog()).toEqual([])
  })

  it('labels classes, multiword subjects, and both supported languages', async () => {
    const { classLabel, subjectLabel, langLabel } = await import('../lib/catalog')
    expect(classLabel('pre-primary')).toBe('Pre-Primary')
    expect(classLabel('12')).toBe('Class 12')
    expect(subjectLabel('social-science')).toBe('Social Science')
    expect(langLabel('hi')).toBe('हिंदी')
    expect(langLabel('en')).toBe('English')
  })

  it('includes pre-primary followed by every school class exactly once', async () => {
    const { CLASSES } = await import('../lib/catalog')
    expect(CLASSES).toEqual([
      'pre-primary',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ])
  })
})
