import { describe, expect, it } from 'vitest'
import { parseJson } from './parse'

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('{"name":"Maeve","age":28}')).toEqual({
      ok: true,
      value: { name: 'Maeve', age: 28 },
    })
  })

  it('reports empty input without throwing', () => {
    expect(parseJson('  ')).toEqual({
      ok: false,
      error: { message: 'JSON input is empty' },
    })
  })

  it('reports a useful error for malformed JSON', () => {
    const result = parseJson('{"name":}')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('Invalid JSON')
      if (result.error.line !== undefined || result.error.column !== undefined) {
        expect(result.error.line).toBeTypeOf('number')
        expect(result.error.column).toBeTypeOf('number')
      }
    }
  })
})
