import { parseJson } from './parse'
import type { JsonError } from './types'

export type ValidationResult = { ok: true } | { ok: false; error: JsonError }

export function validateJson(source: string): ValidationResult {
  const parsed = parseJson(source)
  return parsed.ok ? { ok: true } : parsed
}
