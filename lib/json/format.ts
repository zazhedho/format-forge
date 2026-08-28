import { parseJson } from './parse'
import type { ParseResult } from './types'

type TextResult = ParseResult<string>

export function formatJson(source: string): TextResult {
  const parsed = parseJson(source)
  return parsed.ok ? { ok: true, value: JSON.stringify(parsed.value, null, 2) } : parsed
}

export function minifyJson(source: string): TextResult {
  const parsed = parseJson(source)
  return parsed.ok ? { ok: true, value: JSON.stringify(parsed.value) } : parsed
}
