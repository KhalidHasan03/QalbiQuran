import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Wraps a named export of a lazily imported module in `React.lazy`, so page
 * components can be code-split without converting them to default exports.
 */
export function lazyPage<TModule extends Record<string, unknown>, TName extends keyof TModule>(
  loader: () => Promise<TModule>,
  name: TName,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const module = await loader()
    return { default: module[name] as ComponentType }
  })
}
