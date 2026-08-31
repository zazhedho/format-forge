import { describe, expect, it } from 'vitest'
import { compareText } from './diff'

describe('compareText', () => {
  it('pairs changed lines side by side', () => {
    expect(compareText('name\nrole', 'name\nteam')).toEqual([
      { type: 'equal', left: { lineNumber: 1, text: 'name' }, right: { lineNumber: 1, text: 'name' } },
      { type: 'changed', left: { lineNumber: 2, text: 'role' }, right: { lineNumber: 2, text: 'team' } },
    ])
  })

  it('keeps inserted and removed lines aligned', () => {
    expect(compareText('one\nthree', 'one\ntwo\nthree')).toEqual([
      { type: 'equal', left: { lineNumber: 1, text: 'one' }, right: { lineNumber: 1, text: 'one' } },
      { type: 'added', right: { lineNumber: 2, text: 'two' } },
      { type: 'equal', left: { lineNumber: 2, text: 'three' }, right: { lineNumber: 3, text: 'three' } },
    ])
  })

  it('returns no rows for two empty inputs', () => {
    expect(compareText('', '')).toEqual([])
  })
})
