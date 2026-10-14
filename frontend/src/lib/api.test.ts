import { describe, expect, it } from 'vitest'
import { apiErrorMessage } from './api'

function axiosError(data: unknown) {
  return { isAxiosError: true, response: { data } }
}

describe('apiErrorMessage', () => {
  it('returns the first validation error message', () => {
    const error = axiosError({
      message: 'The given data was invalid.',
      errors: { email: ['The email field is required.'], name: ['The name field is required.'] },
    })

    expect(apiErrorMessage(error)).toBe('The email field is required.')
  })

  it('falls back to the top-level message', () => {
    expect(apiErrorMessage(axiosError({ message: 'Unauthenticated.' }))).toBe('Unauthenticated.')
  })

  it('returns the provided fallback for unknown errors', () => {
    expect(apiErrorMessage(new Error('boom'), 'Custom fallback')).toBe('Custom fallback')
  })

  it('uses a default fallback when none is supplied', () => {
    expect(apiErrorMessage(null)).toBe('Something went wrong.')
  })
})
