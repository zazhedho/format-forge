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

  it('returns YAML output for JSON to YAML', () => {
    expect(runTool('json-to-yaml', '{"name":"Maeve"}')).toEqual({
      ok: true,
      output: { kind: 'yaml', value: 'name: Maeve\n' },
    })
  })

  it('returns XML output for JSON to XML', () => {
    expect(runTool('json-to-xml', '{"name":"Maeve"}')).toEqual({
      ok: true,
      output: {
        kind: 'xml',
        value: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>Maeve</name>\n</root>',
      },
    })
  })

  it('forwards JSON to XML options through the tool runner', () => {
    expect(runTool('json-to-xml', '{"tags":["json","tools"]}', {
      xmlOptions: {
        rootElement: 'catalog',
        arrayItem: 'tag',
        declaration: false,
        format: false,
      },
    })).toEqual({
      ok: true,
      output: {
        kind: 'xml',
        value: '<catalog><tags><tag>json</tag><tag>tools</tag></tags></catalog>',
      },
    })
  })

  it('returns formatted JSON output for XML to JSON', () => {
    expect(runTool('xml-to-json', '<root><name>Maeve</name></root>')).toEqual({
      ok: true,
      output: { kind: 'text', value: '{\n  "root": {\n    "name": "Maeve"\n  }\n}' },
    })
  })

  it('returns a readable error for malformed XML', () => {
    const result = runTool('xml-to-json', '<root><name></root>')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toMatch(/Invalid XML:/)
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
