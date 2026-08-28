import { describe, expect, it } from 'vitest'
import { highlightJson } from './highlight'

describe('highlightJson', () => {
  it('tokenizes empty string', () => {
    expect(highlightJson('')).toEqual([])
  })

  it('identifies indent levels, keys, strings, numbers, booleans, and nulls', () => {
    const json = `{\n  "name": "Format Forge",\n  "count": 42,\n  "active": true,\n  "data": null,\n  "list": [\n    "item"\n  ]\n}`
    const lines = highlightJson(json)

    expect(lines).toHaveLength(9)

    // Line 1: "{"
    expect(lines[0].lineNumber).toBe(1)
    expect(lines[0].indentCount).toBe(0)
    expect(lines[0].tokens).toEqual([{ type: 'bracket', value: '{' }])

    // Line 2: '  "name": "Format Forge",'
    expect(lines[1].lineNumber).toBe(2)
    expect(lines[1].indentCount).toBe(1)
    expect(lines[1].tokens[0]).toEqual({ type: 'key', value: '"name"' })
    expect(lines[1].tokens[1]).toEqual({ type: 'punct', value: ':' })
    expect(lines[1].tokens[3]).toEqual({ type: 'string', value: '"Format Forge"' })
    expect(lines[1].tokens[4]).toEqual({ type: 'punct', value: ',' })

    // Line 3: '  "count": 42,'
    expect(lines[2].tokens[3]).toEqual({ type: 'number', value: '42' })

    // Line 4: '  "active": true,'
    expect(lines[3].tokens[3]).toEqual({ type: 'boolean', value: 'true' })

    // Line 5: '  "data": null,'
    expect(lines[4].tokens[3]).toEqual({ type: 'null', value: 'null' })

    // Line 7: '    "item"'
    expect(lines[6].indentCount).toBe(2)
    expect(lines[6].tokens[0]).toEqual({ type: 'string', value: '"item"' })
  })
})
