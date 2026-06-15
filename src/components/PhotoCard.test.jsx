import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PhotoCard from './PhotoCard'

const photo = {
  slug: 'test-photo',
  title: 'Test Photo',
  year: 2025,
  genres: ['landscape'],
  src: '/photos/test.jpg',
  aspectRatio: '3/2',
}

describe('PhotoCard', () => {
  it('renders an image with correct src and alt', () => {
    render(
      <MemoryRouter>
        <PhotoCard photo={photo} />
      </MemoryRouter>
    )
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/photos/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test Photo')
  })

  it('links to the correct photo detail route', () => {
    render(
      <MemoryRouter>
        <PhotoCard photo={photo} />
      </MemoryRouter>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/photo/test-photo')
  })

  it('applies portrait class for 2/3 aspect ratio', () => {
    const portraitPhoto = { ...photo, aspectRatio: '2/3' }
    const { container } = render(
      <MemoryRouter>
        <PhotoCard photo={portraitPhoto} />
      </MemoryRouter>
    )
    expect(container.firstChild).toHaveClass('photo-card--portrait')
  })
})
