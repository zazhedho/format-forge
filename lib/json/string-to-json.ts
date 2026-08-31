import { parseJson } from './parse'
import type { ParseResult } from './types'

type FormatMode = 'pretty' | 'minify'

export function stringToJson(source: string, mode: FormatMode = 'pretty'): ParseResult<string> {
  const parsedString = parseJson(source)
  if (!parsedString.ok) return parsedString
  if (typeof parsedString.value !== 'string') {
    return { ok: false, error: { message: 'JSON input must be a JSON string' } }
  }

  const parsedJson = parseJson(parsedString.value)
  if (!parsedJson.ok) return parsedJson

  return {
    ok: true,
    value: mode === 'minify' ? JSON.stringify(parsedJson.value) : JSON.stringify(parsedJson.value, null, 2),
  }
}
