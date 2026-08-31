import { describe, expect, it } from 'vitest'
import { highlightJson } from './highlight'
import { getCollapsibleRanges } from './collapse'

describe('getCollapsibleRanges', () => {
  it('matches nested object and array lines', () => {
    const lines = highlightJson('{\n  "items": [\n    {\n      "id": 1\n    }\n  ]\n}')

    expect(getCollapsibleRanges(lines)).toEqual(new Map([
      [1, 7],
      [2, 6],
      [3, 5],
    ]))
  })

  it('ignores brackets inside string tokens', () => {
    const lines = highlightJson('{\n  "text": "[not a node]"\n}')

    expect(getCollapsibleRanges(lines)).toEqual(new Map([[1, 3]]))
  })
})
