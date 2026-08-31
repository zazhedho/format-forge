import { describe, expect, it } from 'vitest'
import { downloadData, copyText, getOutputStatusLabel } from './output'
import { toTableModel } from '../json/table'

describe('tool output actions', () => {
  it('uses the generated format for output status labels', () => {
    expect(getOutputStatusLabel({ kind: 'table', model: toTableModel({ name: 'Maeve' }) })).toBe('Valid JSON')
    expect(getOutputStatusLabel({ kind: 'text', value: '{}' })).toBe('Valid JSON')
    expect(getOutputStatusLabel({ kind: 'csv', value: '' })).toBe('Valid CSV')
    expect(getOutputStatusLabel({ kind: 'yaml', value: '' })).toBe('Valid YAML')
    expect(getOutputStatusLabel({ kind: 'xml', value: '' })).toBe('Valid XML')
    expect(getOutputStatusLabel({ kind: 'go', value: '' })).toBe('Generated Go')
    expect(getOutputStatusLabel({ kind: 'status' })).toBe('')
  })

  it('uses text output for copy and JSON download', () => {
    const result = { ok: true as const, output: { kind: 'text' as const, value: '{"name":"Maeve"}' } }

    expect(copyText(result)).toBe('{"name":"Maeve"}')
    expect(downloadData(result)).toEqual({ content: '{"name":"Maeve"}', extension: 'json', type: 'application/json;charset=utf-8' })
  })

  it('uses raw CSV output for copy and CSV download', () => {
    const result = { ok: true as const, output: { kind: 'csv' as const, value: 'name,role\nMaeve,Engineer' } }

    expect(copyText(result)).toBe('name,role\nMaeve,Engineer')
    expect(downloadData(result)).toEqual({ content: 'name,role\nMaeve,Engineer', extension: 'csv', type: 'text/csv;charset=utf-8' })
  })

  it('uses raw YAML output for copy and YAML download', () => {
    const result = { ok: true as const, output: { kind: 'yaml' as const, value: 'name: Maeve\n' } }

    expect(copyText(result)).toBe('name: Maeve\n')
    expect(downloadData(result)).toEqual({ content: 'name: Maeve\n', extension: 'yaml', type: 'application/yaml;charset=utf-8' })
  })

  it('uses raw XML output for copy and XML download', () => {
    const value = '<?xml version="1.0" encoding="UTF-8"?>\n<root />'
    const result = { ok: true as const, output: { kind: 'xml' as const, value } }

    expect(copyText(result)).toBe(value)
    expect(downloadData(result)).toEqual({ content: value, extension: 'xml', type: 'application/xml;charset=utf-8' })
  })

  it('uses raw Go output for copy and Go download', () => {
    const value = 'type Root struct {}'
    const result = { ok: true as const, output: { kind: 'go' as const, value } }

    expect(copyText(result)).toBe(value)
    expect(downloadData(result)).toEqual({ content: value, extension: 'go', type: 'text/plain;charset=utf-8' })
  })

  it('uses TSV for table copy and CSV for table download', () => {
    const result = { ok: true as const, output: { kind: 'table' as const, model: toTableModel({ name: 'Maeve' }) } }

    expect(copyText(result)).toBe('key\tvalue\nname\tMaeve')
    expect(downloadData(result)).toEqual({ content: 'key,value\nname,Maeve', extension: 'csv', type: 'text/csv;charset=utf-8' })
  })

  it('does not expose actions for status or failed results', () => {
    expect(copyText({ ok: true, output: { kind: 'status' } })).toBe('')
    expect(downloadData({ ok: true, output: { kind: 'status' } })).toBeNull()
    expect(copyText({ ok: false, error: { message: 'Invalid JSON' } })).toBe('')
    expect(downloadData({ ok: false, error: { message: 'Invalid JSON' } })).toBeNull()
  })
})
