import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { photos } from '../data/photos'
import Gallery from './Gallery'

vi.mock('../context/PhotosContext', () => ({
  usePhotos: () => ({
    photos,
    genres: ['landscape', 'street', 'portrait', 'travel'],
    loading: false,
  }),
}))

describe('Gallery', () => {
  it('shows all photos by default', () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    const images = screen.getAllByRole('img')
    expect(images.length).toBe(12)
  })

  it('filters to only landscape photos when Landscape chip is clicked', async () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    await userEvent.click(screen.getByText(/^landscape/i))
    const images = screen.getAllByRole('img')
    expect(images.length).toBe(6)
  })

  it('shows All chip as active by default', () => {
    render(<MemoryRouter><Gallery /></MemoryRouter>)
    const allChip = screen.getByText(/^All/).closest('.filter-chip')
    expect(allChip).toHaveClass('filter-chip--active')
  })
})
