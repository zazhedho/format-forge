export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type JsonError = {
  message: string
  position?: number
  line?: number
  column?: number
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: JsonError }

export type TableCell = {
  path: string
  value: JsonValue
}

export type KeyValueRow = {
  path: string
  key: string
  cell: TableCell
}

export type RecordRow = {
  path: string
  cells: Record<string, TableCell | undefined>
}

export type TableModel =
  | { kind: 'scalar'; cell: TableCell }
  | { kind: 'key-value'; rows: KeyValueRow[] }
  | { kind: 'records'; columns: string[]; rows: RecordRow[] }
