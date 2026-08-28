import type { JsonError, JsonValue, ParseResult } from './types'

function locationAt(source: string, position: number) {
  const safePosition = Math.max(0, Math.min(position, source.length))
  const before = source.slice(0, safePosition)
  const line = before.split('\n').length
  const lastBreak = before.lastIndexOf('\n')
  return { position: safePosition, line, column: safePosition - lastBreak }
}

function errorFor(source: string, error: unknown): JsonError {
  const message = error instanceof Error ? error.message : 'Unknown JSON parsing error'
  const positionMatch = message.match(/position\s+(\d+)/i)
  if (positionMatch) {
    return { message: `Invalid JSON: ${message}`, ...locationAt(source, Number(positionMatch[1])) }
  }

  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (lineColumnMatch) {
    return {
      message: `Invalid JSON: ${message}`,
      line: Number(lineColumnMatch[1]),
      column: Number(lineColumnMatch[2]),
    }
  }

  return { message: `Invalid JSON: ${message}` }
}

export function parseJson(source: string): ParseResult<JsonValue> {
  if (!source.trim()) return { ok: false, error: { message: 'JSON input is empty' } }

  try {
    return { ok: true, value: JSON.parse(source) as JsonValue }
  } catch (error) {
    return { ok: false, error: errorFor(source, error) }
  }
}
