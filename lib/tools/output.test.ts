import { describe, expect, it } from 'vitest'
import { downloadData, copyText } from './output'
import { toTableModel } from '../json/table'

describe('tool output actions', () => {
  it('uses text output for copy and JSON download', () => {
    const result = { ok: true as const, output: { kind: 'text' as const, value: '{"name":"Maeve"}' } }

    expect(copyText(result)).toBe('{"name":"Maeve"}')
    expect(downloadData(result)).toEqual({ content: '{"name":"Maeve"}', extension: 'json', type: 'application/json;charset=utf-8' })
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
