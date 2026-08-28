import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson } from './format'
import { validateJson } from './validate'

describe('JSON text tools', () => {
  it('pretty-prints valid JSON with two spaces', () => {
    expect(formatJson('{"name":"Maeve"}')).toEqual({ ok: true, value: '{\n  "name": "Maeve"\n}' })
  })

  it('minifies valid JSON', () => {
    expect(minifyJson('{ "name": "Maeve" }')).toEqual({ ok: true, value: '{"name":"Maeve"}' })
  })

  it('returns the parser error for invalid formatting input', () => {
    const result = formatJson('{"name":}')
    expect(result.ok).toBe(false)
  })

  it('validates without changing the source', () => {
    expect(validateJson('{"active":true}')).toEqual({ ok: true })
    expect(validateJson('{"active":}').ok).toBe(false)
  })
})
