import { describe, expect, it } from 'vitest'
import { jsonToString } from './json-to-string'

describe('jsonToString', () => {
  it('returns a quoted escaped string for valid JSON', () => {
    expect(jsonToString('{"name":"Maeve"}')).toEqual({
      ok: true,
      value: '"{\\n  \\"name\\": \\"Maeve\\"\\n}"',
    })
  })

  it('minifies the inner JSON before escaping it', () => {
    expect(jsonToString('{"name": "Maeve"}', 'minify')).toEqual({
      ok: true,
      value: '"{\\"name\\":\\"Maeve\\"}"',
    })
  })

  it('returns the shared parser error for malformed JSON', () => {
    const result = jsonToString('{"name":}')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Invalid JSON')
  })
})
