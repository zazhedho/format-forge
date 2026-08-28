import type { JsonValue, TableCell, TableModel } from './types'

function valueText(value: JsonValue) {
  if (typeof value === 'string') return value
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value) ?? ''
  return String(value)
}

function cellText(cell: TableCell | undefined) {
  return cell ? valueText(cell.value) : ''
}

function rowsFor(model: TableModel): string[][] {
  if (model.kind === 'scalar') return [[cellText(model.cell)]]
  if (model.kind === 'key-value') return [['key', 'value'], ...model.rows.map((row) => [row.key, cellText(row.cell)])]
  return [model.columns, ...model.rows.map((row) => model.columns.map((column) => cellText(row.cells[column])))]
}

function csvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function tableToTsv(model: TableModel) {
  return rowsFor(model).map((row) => row.join('\t')).join('\n')
}

export function tableToCsv(model: TableModel) {
  return rowsFor(model).map((row) => row.map(csvCell).join(',')).join('\n')
}
