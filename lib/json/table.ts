import type { JsonValue, RecordRow, TableCell, TableModel } from './types'

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pathFor(parent: string, key: string) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`
}

function cell(path: string, value: JsonValue): TableCell {
  return { path, value }
}

function isRecordArray(value: JsonValue[]): value is Array<{ [key: string]: JsonValue }> {
  return value.length > 0 && value.every(isObject)
}

export function toTableModel(value: JsonValue, path = '$'): TableModel {
  if (Array.isArray(value)) {
    if (isRecordArray(value)) {
      const columns = value.reduce<string[]>((all, item) => {
        Object.keys(item).forEach((key) => {
          if (!all.includes(key)) all.push(key)
        })
        return all
      }, [])
      const rows: RecordRow[] = value.map((item, index) => ({
        path: `${path}[${index}]`,
        cells: Object.fromEntries(columns.map((key) => {
          const keyPath = pathFor(`${path}[${index}]`, key)
          return [key, key in item ? cell(keyPath, item[key]) : undefined]
        })),
      }))
      return { kind: 'records', columns, rows }
    }

    return {
      kind: 'key-value',
      rows: value.map((item, index) => ({
        path: `${path}[${index}]`,
        key: String(index),
        cell: cell(`${path}[${index}]`, item),
      })),
    }
  }

  if (isObject(value)) {
    return {
      kind: 'key-value',
      rows: Object.entries(value).map(([key, item]) => {
        const itemPath = pathFor(path, key)
        return { path: itemPath, key, cell: cell(itemPath, item) }
      }),
    }
  }

  return { kind: 'scalar', cell: cell(path, value) }
}
