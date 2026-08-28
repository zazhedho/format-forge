import type { ToolId } from './registry'

const sample = `{
  "company": "Format Forge",
  "employees": [
    { "name": "Maeve Winters", "role": "Engineer", "active": true },
    { "name": "Jon Bell", "role": "Analyst", "active": false }
  ],
  "tags": ["json", "tools"]
}`

export const samples: Record<ToolId, string> = {
  'json-to-table': sample,
  'json-formatter': sample,
  'json-fixer': '{"name":"Maeve",}',
  'json-validator': sample,
}
