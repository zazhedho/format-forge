import { fixJson } from '../json/fix'
import { formatJson, minifyJson } from '../json/format'
import { parseJson } from '../json/parse'
import { toTableModel } from '../json/table'
import { validateJson } from '../json/validate'
import type { TableModel } from '../json/types'
import type { ToolId } from './registry'

export type ToolOutput =
  | { kind: 'table'; model: TableModel }
  | { kind: 'text'; value: string; warnings?: string[] }
  | { kind: 'status' }

export type ToolRunResult =
  | { ok: true; output: ToolOutput }
  | { ok: false; error: { message: string; line?: number; column?: number; position?: number }; warnings?: string[] }

export function runTool(toolId: ToolId, source: string, options: { formatMode?: 'pretty' | 'minify' } = {}): ToolRunResult {
  if (toolId === 'json-to-table') {
    const parsed = parseJson(source)
    return parsed.ok ? { ok: true, output: { kind: 'table', model: toTableModel(parsed.value) } } : parsed
  }

  if (toolId === 'json-formatter') {
    const result = options.formatMode === 'minify' ? minifyJson(source) : formatJson(source)
    return result.ok ? { ok: true, output: { kind: 'text', value: result.value } } : result
  }

  if (toolId === 'json-fixer') {
    const result = fixJson(source)
    return result.ok
      ? { ok: true, output: { kind: 'text', value: result.value, warnings: result.warnings } }
      : result
  }

  const result = validateJson(source)
  return result.ok ? { ok: true, output: { kind: 'status' } } : result
}
