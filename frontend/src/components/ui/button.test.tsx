import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Save changes</Button>)

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('defaults to type="button"', () => {
    render(<Button>Go</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('merges custom class names', () => {
    render(<Button className="custom-class">Go</Button>)

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
