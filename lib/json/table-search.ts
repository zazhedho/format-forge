import { toTableModel } from './table'
import type { JsonValue, TableCell, TableModel } from './types'

function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null
}

function valueText(value: JsonValue) {
  if (typeof value === 'string') return value
  if (value === null) return 'null'
  if (isContainer(value)) return ''
  return String(value)
}

function includesQuery(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query)
}

function visitCell(cell: TableCell, label: string, query: string, matches: string[]) {
  const selfMatch = includesQuery(`${label} ${cell.path} ${valueText(cell.value)}`, query)
  const childMatch = isContainer(cell.value)
    ? visitModel(toTableModel(cell.value, cell.path), query, matches)
    : false
  if (selfMatch) matches.push(cell.path)
  return selfMatch || childMatch
}

function visitModel(model: TableModel, query: string, matches: string[]): boolean {
  if (model.kind === 'scalar') return visitCell(model.cell, '', query, matches)

  if (model.kind === 'key-value') {
    return model.rows.reduce((found, row) => visitCell(row.cell, row.key, query, matches) || found, false)
  }

  return model.rows.reduce((found, row) => {
    const rowMatch = includesQuery(row.path, query)
    const cellMatch = model.columns.reduce((rowFound, column) => {
      const cell = row.cells[column]
      return cell ? visitCell(cell, column, query, matches) || rowFound : rowFound
    }, false)
    return rowMatch || cellMatch || found
  }, false)
}

function collectExpandable(model: TableModel, paths: string[]) {
  if (model.kind === 'scalar') return
  const cells = model.kind === 'key-value'
    ? model.rows.map((row) => row.cell)
    : model.rows.flatMap((row) => model.columns.flatMap((column) => row.cells[column] ? [row.cells[column] as TableCell] : []))

  cells.forEach((cell) => {
    if (!isContainer(cell.value)) return
    paths.push(cell.path)
    collectExpandable(toTableModel(cell.value, cell.path), paths)
  })
}

export function searchTableModel(model: TableModel, query: string) {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return { model, matches: [] as string[] }
  const matches: string[] = []
  return visitModel(model, normalized, matches) ? { model, matches } : { model: null, matches }
}

export function getExpandablePaths(model: TableModel) {
  const paths: string[] = []
  collectExpandable(model, paths)
  return paths
}
