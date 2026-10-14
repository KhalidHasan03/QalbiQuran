import { useEffect } from 'react'

const SITE_NAME = 'QalbiQuran'
const DEFAULT_DESCRIPTION =
  'QalbiQuran — read, listen and reflect on the Holy Qur’an in Arabic, English and Bangla with streaks, goals and progress.'

type MetaAttribute = 'name' | 'property'

function setMeta(attribute: MetaAttribute, key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * Keeps the document title and key social/description meta tags in sync with
 * the active route. Runs client-side only; safe to call on every render.
 */
export function useSeo(title?: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Read the Qur’an daily`
    const desc = description ?? DEFAULT_DESCRIPTION

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
  }, [title, description])
}
