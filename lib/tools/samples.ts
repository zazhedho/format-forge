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

export const samples: Record<ToolId, string> = {
  'json-to-table': sample,
  'json-formatter': sample,
  'string-to-json': stringSample,
  'json-fixer': '{"name":"Maeve",}',
  'json-validator': sample,
}
