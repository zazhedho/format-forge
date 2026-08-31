import { fixJson } from '../json/fix'
import { formatJson, minifyJson } from '../json/format'
import { jsonToString } from '../json/json-to-string'
import { parseJson } from '../json/parse'
import { stringToJson } from '../json/string-to-json'
import { toTableModel } from '../json/table'
import { tableToCsv } from '../json/table-export'
import { validateJson } from '../json/validate'
import { jsonToYaml } from '../json/yaml'
import { jsonToXml, type JsonToXmlOptions } from '../json/xml'
import type { TableModel } from '../json/types'
import type { ToolId } from './registry'

export type ToolOutput =
  | { kind: 'table'; model: TableModel }
  | { kind: 'csv'; value: string; warnings?: string[] }
  | { kind: 'yaml'; value: string; warnings?: string[] }
  | { kind: 'xml'; value: string; warnings?: string[] }
  | { kind: 'text'; value: string; warnings?: string[] }
  | { kind: 'status' }

export type ToolRunResult =
  | { ok: true; output: ToolOutput }
  | { ok: false; error: { message: string; line?: number; column?: number; position?: number }; warnings?: string[] }

export function runTool(
  toolId: ToolId,
  source: string,
  options: { formatMode?: 'pretty' | 'minify'; xmlOptions?: JsonToXmlOptions } = {}
): ToolRunResult {
  if (toolId === 'json-to-table') {
    const parsed = parseJson(source)
    return parsed.ok ? { ok: true, output: { kind: 'table', model: toTableModel(parsed.value) } } : parsed
  }

  if (toolId === 'json-to-csv') {
    const parsed = parseJson(source)
    return parsed.ok ? { ok: true, output: { kind: 'csv', value: tableToCsv(toTableModel(parsed.value)) } } : parsed
  }

  if (toolId === 'json-to-yaml') {
    const parsed = parseJson(source)
    return parsed.ok ? { ok: true, output: { kind: 'yaml', value: jsonToYaml(parsed.value) } } : parsed
  }

  if (toolId === 'json-to-xml') {
    const parsed = parseJson(source)
    if (!parsed.ok) return parsed

    try {
      return { ok: true, output: { kind: 'xml', value: jsonToXml(parsed.value, options.xmlOptions) } }
    } catch (error) {
      return {
        ok: false,
        error: { message: error instanceof Error ? error.message : 'Could not convert JSON to XML' },
      }
    }
  }

  if (toolId === 'json-formatter') {
    const result = options.formatMode === 'minify' ? minifyJson(source) : formatJson(source)
    return result.ok ? { ok: true, output: { kind: 'text', value: result.value } } : result
  }

  if (toolId === 'string-to-json') {
    const result = stringToJson(source, options.formatMode === 'minify' ? 'minify' : 'pretty')
    return result.ok ? { ok: true, output: { kind: 'text', value: result.value } } : result
  }

  if (toolId === 'json-to-string') {
    const result = jsonToString(source, options.formatMode === 'minify' ? 'minify' : 'pretty')
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
