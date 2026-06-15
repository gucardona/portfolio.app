import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar'
import { GENRES } from '../data/photos'

describe('FilterBar', () => {
  it('renders All chip and one chip per genre', () => {
    render(<FilterBar genres={GENRES} active="all" counts={{}} onChange={() => {}} />)
    expect(screen.getByText(/^All/)).toBeInTheDocument()
    GENRES.forEach(g => {
      expect(screen.getByText(new RegExp(g, 'i'))).toBeInTheDocument()
    })
  })

  it('marks the active chip', () => {
    render(<FilterBar genres={GENRES} active="landscape" counts={{}} onChange={() => {}} />)
    const chip = screen.getByText(/landscape/i).closest('.filter-chip')
    expect(chip).toHaveClass('filter-chip--active')
  })

  it('calls onChange with the clicked genre', async () => {
    const onChange = vi.fn()
    render(<FilterBar genres={GENRES} active="all" counts={{}} onChange={onChange} />)
    await userEvent.click(screen.getByText(/street/i))
    expect(onChange).toHaveBeenCalledWith('street')
  })

  it('calls onChange with "all" when All chip is clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar genres={GENRES} active="landscape" counts={{}} onChange={onChange} />)
    await userEvent.click(screen.getByText(/^All/))
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('shows photo count next to each chip', () => {
    const counts = { all: 6, landscape: 3, street: 1, portrait: 1, travel: 2 }
    render(<FilterBar genres={GENRES} active="all" counts={counts} onChange={() => {}} />)
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
