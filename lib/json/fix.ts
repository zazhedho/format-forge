import { parseJson } from './parse'
import type { JsonError } from './types'

export type FixResult =
  | { ok: true; value: string; warnings: string[] }
  | { ok: false; error: JsonError; warnings: string[] }

function removeTrailingCommas(source: string) {
  let output = ''
  let inString = false
  let escaped = false
  let changed = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (character === '"' && !escaped) inString = !inString
    escaped = character === '\\' && !escaped

    if (!inString && character === ',') {
      const rest = source.slice(index + 1)
      if (/^\s*[}\]]/.test(rest)) {
        changed = true
        continue
      }
    }

    output += character
  }

  return { output, changed }
}

export function fixJson(source: string): FixResult {
  const candidate = removeTrailingCommas(source)
  const parsed = parseJson(candidate.output)
  if (!parsed.ok) return { ok: false, error: parsed.error, warnings: [] }

  return {
    ok: true,
    value: JSON.stringify(parsed.value, null, 2),
    warnings: candidate.changed ? ['Removed trailing comma(s).'] : [],
  }
}
