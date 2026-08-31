import { describe, expect, it } from 'vitest'
import { runTool } from './run-tool'

describe('runTool', () => {
  it('returns a table output for JSON to Table', () => {
    const result = runTool('json-to-table', '{"name":"Maeve"}')
    expect(result).toEqual({ ok: true, output: { kind: 'table', model: expect.any(Object) } })
  })

  it('returns CSV output for JSON to CSV', () => {
    expect(runTool('json-to-csv', '[{"name":"Maeve","role":"Engineer"},{"name":"Jon"}]')).toEqual({
      ok: true,
      output: { kind: 'csv', value: 'name,role\nMaeve,Engineer\nJon,' },
    })
  })

  it('returns text output for the formatter', () => {
    expect(runTool('json-formatter', '{"name":"Maeve"}', { formatMode: 'minify' })).toEqual({
      ok: true,
      output: { kind: 'text', value: '{"name":"Maeve"}' },
    })
  })

  it('returns converted text output for String to JSON', () => {
    expect(runTool('string-to-json', JSON.stringify('{"name":"Maeve"}'))).toEqual({
      ok: true,
      output: { kind: 'text', value: '{\n  "name": "Maeve"\n}' },
    })
  })

  it('returns an escaped text output for JSON to String', () => {
    expect(runTool('json-to-string', '{"name":"Maeve"}')).toEqual({
      ok: true,
      output: { kind: 'text', value: '"{\\n  \\"name\\": \\"Maeve\\"\\n}"' },
    })
  })

  it('returns a status output for the validator', () => {
    expect(runTool('json-validator', '{"ok":true}')).toEqual({
      ok: true,
      output: { kind: 'status' },
    })
  })
})
