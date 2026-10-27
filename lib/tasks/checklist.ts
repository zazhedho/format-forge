export type TaskColumn = { id: string; name: string }
export type Task = { id: string; title: string; checks: Record<string, boolean> }
export type ChecklistData = { columns: TaskColumn[]; tasks: Task[] }
type LegacyTask = { id: string; title: string; done: boolean }

// Tasks track a single hidden "done" check until the first column is added.
export const defaultCheckId = '__default_done__'
const starterColumnIds = new Set(['fixing', 'pr', 'merged', 'finish'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isColumn(value: unknown): value is TaskColumn {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.id !== '' && typeof value.name === 'string' && value.name.trim() !== ''
}

function isLegacyTask(value: unknown): value is LegacyTask {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.title === 'string' && value.title.trim() !== '' && typeof value.done === 'boolean'
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value) || !isRecord(value.checks)) return false
  return typeof value.id === 'string' && typeof value.title === 'string' && value.title.trim() !== '' && Object.values(value.checks).every((check) => typeof check === 'boolean')
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const ids = new Set<string>()
  return items.filter((item) => {
    if (ids.has(item.id)) return false
    ids.add(item.id)
    return true
  })
}

function alignChecks(checks: Record<string, boolean>, columns: TaskColumn[]) {
  return columns.length
    ? Object.fromEntries(columns.map((column) => [column.id, checks[column.id] === true]))
    : { [defaultCheckId]: checks[defaultCheckId] === true }
}

export function readChecklist(value: unknown): ChecklistData {
  if (Array.isArray(value)) {
    return {
      columns: [],
      tasks: uniqueById(value.filter(isLegacyTask).filter((task) => !task.id.startsWith('starter-')).map((task) => ({
        id: task.id,
        title: task.title,
        checks: { [defaultCheckId]: task.done },
      }))),
    }
  }

  if (!isRecord(value)) return { columns: [], tasks: [] }

  const columns = uniqueById(Array.isArray(value.columns)
    ? value.columns.filter(isColumn).filter((column) => !starterColumnIds.has(column.id)).map((column) => ({ ...column, name: column.name.trim() }))
    : [])
  const tasks = uniqueById(Array.isArray(value.tasks)
    ? value.tasks.filter(isTask).filter((task) => !task.id.startsWith('starter-')).map((task) => ({
      id: task.id,
      title: task.title,
      checks: alignChecks(task.checks, columns),
    }))
    : [])

  return { columns, tasks }
}

export function isTaskComplete(task: Task, columns: TaskColumn[]) {
  return columns.length > 0
    ? columns.every((column) => task.checks[column.id] === true)
    : task.checks[defaultCheckId] === true
}

export function addColumn(data: ChecklistData, name: string, createId: () => string): ChecklistData {
  const column = { id: createId(), name: name.trim() }
  if (!column.name) return data

  // Keep finished tasks finished: the hidden done check becomes a visible "Done" column.
  const keepsDoneState = data.columns.length === 0 && data.tasks.some((task) => task.checks[defaultCheckId] === true)
  const doneColumn = keepsDoneState ? { id: createId(), name: 'Done' } : null
  const columns = [...data.columns, column, ...(doneColumn ? [doneColumn] : [])]

  return {
    columns,
    tasks: data.tasks.map((task) => ({
      ...task,
      checks: Object.fromEntries(columns.map((item) => [
        item.id,
        item.id === doneColumn?.id ? task.checks[defaultCheckId] === true : item.id !== column.id && task.checks[item.id] === true,
      ])),
    })),
  }
}

export function removeColumns(data: ChecklistData, columnIds: string[]): ChecklistData {
  const removed = new Set(columnIds)
  const columns = data.columns.filter((column) => !removed.has(column.id))
  return {
    columns,
    tasks: data.tasks.map((task) => ({
      ...task,
      checks: columns.length
        ? alignChecks(task.checks, columns)
        : { [defaultCheckId]: isTaskComplete(task, data.columns) },
    })),
  }
}
