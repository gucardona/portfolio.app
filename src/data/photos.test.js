import { describe, it, expect } from 'vitest'
import { photos, GENRES } from './photos'

describe('photos data', () => {
  it('every photo has required fields', () => {
    photos.forEach(photo => {
      expect(photo.slug).toBeTruthy()
      expect(photo.title).toBeTruthy()
      expect(photo.year).toBeTypeOf('number')
      expect(photo.genres).toBeInstanceOf(Array)
      expect(photo.genres.length).toBeGreaterThan(0)
      expect(photo.src).toBeTruthy()
      expect(['3/2', '2/3', '1']).toContain(photo.aspectRatio)
    })
  })

  it('all photo genres are valid GENRES values', () => {
    photos.forEach(photo => {
      photo.genres.forEach(g => {
        expect(GENRES).toContain(g)
      })
    })
  })

  it('slugs are unique', () => {
    const slugs = photos.map(p => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
