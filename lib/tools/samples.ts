import type { ToolId } from './registry'

const sample = `{
  "company": "Format Forge",
  "employees": [
    { "name": "Maeve Winters", "role": "Engineer", "active": true },
    { "name": "Jon Bell", "role": "Analyst", "active": false }
  ],
  "tags": ["json", "tools"]
}`
const stringSample = JSON.stringify(sample)
const comparisonSample = sample.replace('"Analyst"', '"Product Analyst"')

export const samples: Record<ToolId, string> = {
  'json-to-table': sample,
  'json-formatter': sample,
  'string-to-json': stringSample,
  'json-to-string': sample,
  'json-fixer': '{"name":"Maeve",}',
  'json-validator': sample,
  'compare-text': sample,
}

export const comparisonSamples = {
  'compare-text': comparisonSample,
} as const
