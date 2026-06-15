import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PhotoDetail from './PhotoDetail'

function renderDetail(slug) {
  return render(
    <MemoryRouter initialEntries={[`/photo/${slug}`]}>
      <Routes>
        <Route path="/photo/:slug" element={<PhotoDetail />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PhotoDetail', () => {
  it('renders the photo title and year', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText('Golden Hour, Patagonia')).toBeInTheDocument()
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('renders EXIF fields that are present', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText('1/500s')).toBeInTheDocument()
    expect(screen.getByText('f/2.8')).toBeInTheDocument()
    expect(screen.getByText('400')).toBeInTheDocument()
  })

  it('does not render secondary EXIF block when all secondary fields are absent', () => {
    // dunes-at-dusk has no camera, lens, or location
    renderDetail('dunes-at-dusk')
    expect(screen.queryByText(/Sony/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Location/i)).not.toBeInTheDocument()
  })

  it('shows back link', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText(/back/i)).toBeInTheDocument()
  })

  it('shows Next link when not on last photo', () => {
    renderDetail('golden-hour-patagonia')
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('shows Prev link when not on first photo', () => {
    renderDetail('downtown-rush')
    expect(screen.getByText(/prev/i)).toBeInTheDocument()
  })

  it('shows not-found message for unknown slug', () => {
    renderDetail('no-such-slug')
    expect(screen.getByText(/Photo not found/i)).toBeInTheDocument()
  })
})
