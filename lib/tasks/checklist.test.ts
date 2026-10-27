import { describe, expect, it } from 'vitest'
import { addColumn, defaultCheckId, readChecklist, removeColumns, type ChecklistData } from './checklist'

function idFactory(...ids: string[]) {
  return () => ids.shift() ?? 'unexpected-id'
}

describe('readChecklist', () => {
  it('moves legacy done flags into the default check', () => {
    expect(readChecklist([
      { id: 'a', title: 'Write docs', done: true },
      { id: 'b', title: 'Ship it', done: false },
    ])).toEqual({
      columns: [],
      tasks: [
        { id: 'a', title: 'Write docs', checks: { [defaultCheckId]: true } },
        { id: 'b', title: 'Ship it', checks: { [defaultCheckId]: false } },
      ],
    })
  })

  it('drops starter tasks and invalid entries from legacy lists', () => {
    expect(readChecklist([
      { id: 'starter-1', title: 'Starter', done: false },
      { id: 'a', title: '   ', done: false },
      { id: 'b', title: 'Keep', done: 'yes' },
      null,
      { id: 'c', title: 'Valid', done: false },
    ]).tasks.map((task) => task.id)).toEqual(['c'])
  })

  it('keeps only the first task and column for each id', () => {
    const data = readChecklist({
      columns: [{ id: 'c1', name: 'Review' }, { id: 'c1', name: 'Again' }],
      tasks: [
        { id: 't1', title: 'First', checks: { c1: true } },
        { id: 't1', title: 'Duplicate', checks: { c1: false } },
      ],
    })
    expect(data.columns).toEqual([{ id: 'c1', name: 'Review' }])
    expect(data.tasks).toEqual([{ id: 't1', title: 'First', checks: { c1: true } }])
  })

  it('aligns task checks with the stored columns', () => {
    expect(readChecklist({
      columns: [{ id: 'c1', name: 'Review' }, { id: 'c2', name: 'QA' }],
      tasks: [{ id: 't1', title: 'Task', checks: { c1: true, gone: true } }],
    }).tasks[0]?.checks).toEqual({ c1: true, c2: false })
  })

  it('returns an empty checklist for unreadable values', () => {
    expect(readChecklist('nope')).toEqual({ columns: [], tasks: [] })
    expect(readChecklist(null)).toEqual({ columns: [], tasks: [] })
  })
})

describe('addColumn', () => {
  const doneList: ChecklistData = {
    columns: [],
    tasks: [
      { id: 't1', title: 'Finished', checks: { [defaultCheckId]: true } },
      { id: 't2', title: 'Open', checks: { [defaultCheckId]: false } },
    ],
  }

  it('keeps finished tasks finished when the first column is added', () => {
    expect(addColumn(doneList, 'Review', idFactory('review', 'done'))).toEqual({
      columns: [{ id: 'review', name: 'Review' }, { id: 'done', name: 'Done' }],
      tasks: [
        { id: 't1', title: 'Finished', checks: { review: false, done: true } },
        { id: 't2', title: 'Open', checks: { review: false, done: false } },
      ],
    })
  })

  it('adds only the new column when no task was finished yet', () => {
    const openList: ChecklistData = { columns: [], tasks: [{ id: 't1', title: 'Open', checks: { [defaultCheckId]: false } }] }
    expect(addColumn(openList, 'Review', idFactory('review'))).toEqual({
      columns: [{ id: 'review', name: 'Review' }],
      tasks: [{ id: 't1', title: 'Open', checks: { review: false } }],
    })
  })

  it('adds an unchecked column next to existing ones', () => {
    const data: ChecklistData = {
      columns: [{ id: 'c1', name: 'Review' }],
      tasks: [{ id: 't1', title: 'Task', checks: { c1: true } }],
    }
    expect(addColumn(data, '  QA  ', idFactory('c2'))).toEqual({
      columns: [{ id: 'c1', name: 'Review' }, { id: 'c2', name: 'QA' }],
      tasks: [{ id: 't1', title: 'Task', checks: { c1: true, c2: false } }],
    })
  })

  it('ignores blank names', () => {
    expect(addColumn(doneList, '   ', idFactory('x'))).toBe(doneList)
  })
})

describe('removeColumns', () => {
  const data: ChecklistData = {
    columns: [{ id: 'c1', name: 'Review' }, { id: 'c2', name: 'QA' }],
    tasks: [
      { id: 't1', title: 'Complete', checks: { c1: true, c2: true } },
      { id: 't2', title: 'Partial', checks: { c1: true, c2: false } },
    ],
  }

  it('keeps the other columns checks when one column is removed', () => {
    expect(removeColumns(data, ['c2'])).toEqual({
      columns: [{ id: 'c1', name: 'Review' }],
      tasks: [
        { id: 't1', title: 'Complete', checks: { c1: true } },
        { id: 't2', title: 'Partial', checks: { c1: true } },
      ],
    })
  })

  it('keeps completed tasks done when every column is removed', () => {
    expect(removeColumns(data, ['c1', 'c2']).tasks).toEqual([
      { id: 't1', title: 'Complete', checks: { [defaultCheckId]: true } },
      { id: 't2', title: 'Partial', checks: { [defaultCheckId]: false } },
    ])
  })
})
