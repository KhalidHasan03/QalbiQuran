import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSeo } from './seo'

describe('useSeo', () => {
  it('sets a page title suffixed with the site name', () => {
    renderHook(() => useSeo('Surahs'))

    expect(document.title).toBe('Surahs · QalbiQuran')
  })

  it('falls back to the default title when none is given', () => {
    renderHook(() => useSeo())

    expect(document.title).toContain('QalbiQuran')
  })

  it('updates the description meta tag', () => {
    renderHook(() => useSeo('About', 'About QalbiQuran'))

    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    expect(meta?.content).toBe('About QalbiQuran')
  })
})
