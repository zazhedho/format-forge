import { describe, expect, it } from 'vitest'
import { getInsertIndex, getMoveTarget, moveItemNextTo, previewOrder, reconcileOrder } from './reorder'

describe('getInsertIndex', () => {
  it('counts the rows whose middle is above the pointer', () => {
    expect(getInsertIndex([20, 60, 100], 70)).toBe(2)
  })

  it('inserts before every row when the pointer is above the list', () => {
    expect(getInsertIndex([20, 60, 100], 0)).toBe(0)
  })

  it('inserts after every row when the pointer is below the list', () => {
    expect(getInsertIndex([20, 60, 100], 500)).toBe(3)
  })
})

describe('previewOrder', () => {
  it('moves the dragged item to the insert index among the other items', () => {
    expect(previewOrder(['a', 'b', 'c', 'd'], 'a', 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves the dragged item to the front', () => {
    expect(previewOrder(['a', 'b', 'c'], 'c', 0)).toEqual(['c', 'a', 'b'])
  })

  it('returns the same order when the dragged item is unknown', () => {
    expect(previewOrder(['a', 'b'], 'x', 0)).toEqual(['a', 'b'])
  })
})

describe('getMoveTarget', () => {
  it('places the item after its new previous neighbour', () => {
    expect(getMoveTarget(['b', 'a', 'c'], 'a')).toEqual({ targetId: 'b', after: true })
  })

  it('places the item before its new next neighbour when it is first', () => {
    expect(getMoveTarget(['a', 'b', 'c'], 'a')).toEqual({ targetId: 'b', after: false })
  })

  it('returns null when there is no neighbour to move against', () => {
    expect(getMoveTarget(['a'], 'a')).toBeNull()
  })
})

describe('moveItemNextTo', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

  it('moves an item after the target', () => {
    expect(moveItemNextTo(items, 'a', 'c', true).map((item) => item.id)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item before the target', () => {
    expect(moveItemNextTo(items, 'd', 'b', false).map((item) => item.id)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns the original list when either id is unknown or they match', () => {
    expect(moveItemNextTo(items, 'x', 'b', true)).toBe(items)
    expect(moveItemNextTo(items, 'a', 'x', true)).toBe(items)
    expect(moveItemNextTo(items, 'a', 'a', true)).toBe(items)
  })
})

describe('reconcileOrder', () => {
  it('drops ids that no longer exist and appends new ones', () => {
    expect(reconcileOrder(['c', 'a', 'gone'], ['a', 'b', 'c'])).toEqual(['c', 'a', 'b'])
  })
})
