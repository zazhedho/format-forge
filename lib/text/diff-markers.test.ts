import { describe, expect, it } from 'vitest'
import { getDiffMarker } from './diff-markers'

describe('getDiffMarker', () => {
  it('returns a plus or minus marker for one-sided rows', () => {
    expect(getDiffMarker('added')).toBe('+')
    expect(getDiffMarker('removed')).toBe('−')
  })

  it('does not mark equal, changed, or empty cells', () => {
    expect(getDiffMarker('equal')).toBe('')
    expect(getDiffMarker('changed')).toBe('')
    expect(getDiffMarker('empty')).toBe('')
  })
})
