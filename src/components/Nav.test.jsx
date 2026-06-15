import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nav from './Nav'

describe('Nav', () => {
  it('renders logo and links', () => {
    render(<Nav />)
    expect(screen.getByText('portfolio')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })
})
