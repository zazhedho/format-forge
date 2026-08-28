import { describe, expect, it } from 'vitest'
import { getExpandablePaths, searchTableModel } from './table-search'
import { toTableModel } from './table'

describe('table search', () => {
  const model = toTableModel({ user: { name: 'Maeve Winters', role: 'Engineer' }, active: true })

  it('returns matching paths and keeps matching parents', () => {
    const result = searchTableModel(model, 'maeve')
    expect(result.matches).toEqual(['$.user.name'])
    expect(result.model).not.toBeNull()
  })

  it('collects expandable nested paths', () => {
    expect(getExpandablePaths(model)).toContain('$.user')
  })

  it('returns the original model for an empty query', () => {
    expect(searchTableModel(model, '').model).toEqual(model)
  })
})
