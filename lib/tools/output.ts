import { tableToCsv, tableToTsv } from '../json/table-export'
import type { ToolRunResult } from './run-tool'

export type DownloadData = {
  content: string
  extension: 'csv' | 'json' | 'yaml'
  type: string
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
  return { content: result.output.value, extension: 'json', type: 'application/json;charset=utf-8' }
}
