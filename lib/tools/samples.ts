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
const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <company>Format Forge</company>
  <employees>
    <employee id="1">
      <name>Maeve Winters</name>
      <role>Engineer</role>
      <active>true</active>
    </employee>
    <employee id="2">
      <name>Jon Bell</name>
      <role>Analyst</role>
      <active>false</active>
    </employee>
  </employees>
</catalog>`

export const samples: Record<ToolId, string> = {
  'json-to-table': sample,
  'json-to-csv': sample,
  'json-to-yaml': sample,
  'json-to-xml': sample,
  'json-to-struct': sample,
  'xml-to-json': xmlSample,
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
