import { describe, expect, it } from 'vitest'
import { fixJson } from './fix'

describe('fixJson', () => {
  it('removes trailing commas outside strings', () => {
    expect(fixJson('{"name":"Maeve",}')).toEqual({
      ok: true,
      value: '{\n  "name": "Maeve"\n}',
      warnings: ['Removed trailing comma(s).'],
    })
  })

  it('does not rewrite already-valid JSON', () => {
    expect(fixJson('{"name": "Maeve"}')).toEqual({
      ok: true,
      value: '{\n  "name": "Maeve"\n}',
      warnings: [],
    })
  })

  it('reports input that cannot be safely repaired', () => {
    const result = fixJson('{"name":}')
    expect(result.ok).toBe(false)
  })
})
