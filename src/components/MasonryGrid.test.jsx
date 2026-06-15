import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MasonryGrid from './MasonryGrid'

const photos = [
  { slug: 'a', title: 'A', year: 2025, genres: ['landscape'], src: '/a.jpg', aspectRatio: '3/2' },
  { slug: 'b', title: 'B', year: 2025, genres: ['portrait'], src: '/b.jpg', aspectRatio: '2/3' },
]

describe('MasonryGrid', () => {
  it('renders one image per photo', () => {
    render(
      <MemoryRouter>
        <MasonryGrid photos={photos} />
      </MemoryRouter>
    )
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('renders nothing when photos array is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <MasonryGrid photos={[]} />
      </MemoryRouter>
    )
    expect(container.querySelector('.masonry-grid').children).toHaveLength(0)
  })
})
