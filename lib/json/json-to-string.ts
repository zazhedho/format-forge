import { parseJson } from './parse'
import type { ParseResult } from './types'

type FormatMode = 'pretty' | 'minify'

export function jsonToString(source: string, mode: FormatMode = 'pretty'): ParseResult<string> {
  const parsed = parseJson(source)
  if (!parsed.ok) return parsed

  const json = mode === 'minify' ? JSON.stringify(parsed.value) : JSON.stringify(parsed.value, null, 2)
  return { ok: true, value: JSON.stringify(json) }
}
