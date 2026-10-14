import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast, useToasts } from './toasts'

describe('toast store', () => {
  beforeEach(() => {
    useToasts.setState({ toasts: [] })
    vi.useRealTimers()
  })

  it('pushes a toast with an incrementing id', () => {
    toast.success('Saved')
    toast.error('Failed')

    const toasts = useToasts.getState().toasts
    expect(toasts).toHaveLength(2)
    expect(toasts[0]).toMatchObject({ title: 'Saved', variant: 'success' })
    expect(toasts[1]).toMatchObject({ title: 'Failed', variant: 'error' })
    expect(toasts[1].id).toBeGreaterThan(toasts[0].id)
  })

  it('dismisses a toast by id', () => {
    toast.info('Hello')
    const [first] = useToasts.getState().toasts

    useToasts.getState().dismiss(first.id)

    expect(useToasts.getState().toasts).toHaveLength(0)
  })

  it('auto-dismisses toasts after a timeout', () => {
    vi.useFakeTimers()
    toast.success('Bye')

    expect(useToasts.getState().toasts).toHaveLength(1)
    vi.runAllTimers()
    expect(useToasts.getState().toasts).toHaveLength(0)
  })
})
