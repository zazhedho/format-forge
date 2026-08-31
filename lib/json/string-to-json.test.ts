import { describe, expect, it } from 'vitest'
import { stringToJson } from './string-to-json'

describe('stringToJson', () => {
  it('parses an escaped JSON string and pretty-prints the result', () => {
    expect(stringToJson(JSON.stringify('{"name":"Maeve"}'))).toEqual({
      ok: true,
      value: '{\n  "name": "Maeve"\n}',
    })
  })

  it('supports minified output', () => {
    expect(stringToJson(JSON.stringify('{"name":"Maeve"}'), 'minify')).toEqual({
      ok: true,
      value: '{"name":"Maeve"}',
    })
  })

  it('rejects input that is not a JSON string', () => {
    expect(stringToJson('{"name":"Maeve"}')).toEqual({
      ok: false,
      error: { message: 'JSON input must be a JSON string' },
    })
  })
})
