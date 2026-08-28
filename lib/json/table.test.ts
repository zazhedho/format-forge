import { describe, expect, it } from 'vitest'
import { toTableModel } from './table'

describe('toTableModel', () => {
  it('maps an object to key/value rows', () => {
    expect(toTableModel({ name: 'Maeve', active: true })).toEqual({
      kind: 'key-value',
      rows: [
        { path: '$.name', key: 'name', cell: { path: '$.name', value: 'Maeve' } },
        { path: '$.active', key: 'active', cell: { path: '$.active', value: true } },
      ],
    })
  })

  it('unions columns for an array of objects in first-seen order', () => {
    const model = toTableModel([
      { id: 1, name: 'Laptop' },
      { id: 2, price: 29.99 },
    ])

    expect(model.kind).toBe('records')
    if (model.kind === 'records') {
      expect(model.columns).toEqual(['id', 'name', 'price'])
      expect(model.rows[1].cells.name).toBeUndefined()
    }
  })

  it('keeps nested values in cells', () => {
    const model = toTableModel({ user: { name: 'Maeve' }, tags: ['api', 'json'] })

    expect(model.kind).toBe('key-value')
    if (model.kind === 'key-value') {
      expect(model.rows[0].cell.value).toEqual({ name: 'Maeve' })
      expect(model.rows[1].cell.value).toEqual(['api', 'json'])
    }
  })

  it('represents a primitive root as a scalar', () => {
    expect(toTableModel('ready')).toEqual({
      kind: 'scalar',
      cell: { path: '$', value: 'ready' },
    })
  })
})
