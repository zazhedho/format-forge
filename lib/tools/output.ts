import { tableToCsv, tableToTsv } from '../json/table-export'
import type { ToolOutput, ToolRunResult } from './run-tool'

export type DownloadData = {
  content: string
  extension: 'csv' | 'json' | 'yaml' | 'xml'
  type: string
}

export function getOutputStatusLabel(output: ToolOutput) {
  switch (output.kind) {
    case 'csv':
      return 'Valid CSV'
    case 'yaml':
      return 'Valid YAML'
    case 'xml':
      return 'Valid XML'
    case 'status':
      return ''
    default:
      return 'Valid JSON'
  }
}

export function copyText(result: ToolRunResult) {
  if (!result.ok || result.output.kind === 'status') return ''
  return result.output.kind === 'table' ? tableToTsv(result.output.model) : result.output.value
}

export function downloadData(result: ToolRunResult): DownloadData | null {
  if (!result.ok || result.output.kind === 'status') return null
  if (result.output.kind === 'table') {
    return { content: tableToCsv(result.output.model), extension: 'csv', type: 'text/csv;charset=utf-8' }
  }
  if (result.output.kind === 'csv') {
    return { content: result.output.value, extension: 'csv', type: 'text/csv;charset=utf-8' }
  }
  if (result.output.kind === 'yaml') {
    return { content: result.output.value, extension: 'yaml', type: 'application/yaml;charset=utf-8' }
  }
  if (result.output.kind === 'xml') {
    return { content: result.output.value, extension: 'xml', type: 'application/xml;charset=utf-8' }
  }
  return { content: result.output.value, extension: 'json', type: 'application/json;charset=utf-8' }
}
