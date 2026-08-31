export const tools = [
  {
    id: 'json-to-table',
    title: 'JSON to Table',
    category: 'JSON',
    href: '/json-to-table',
    description: 'Inspect objects and arrays as readable, expandable tables.',
    output: 'table',
  },
  {
    id: 'json-to-csv',
    title: 'JSON to CSV',
    category: 'JSON',
    href: '/json-to-csv',
    description: 'Convert JSON objects and arrays into CSV rows.',
    output: 'csv',
  },
  {
    id: 'json-to-yaml',
    title: 'JSON to YAML',
    category: 'JSON',
    href: '/json-to-yaml',
    description: 'Convert JSON objects and arrays into readable YAML.',
    output: 'yaml',
  },
  {
    id: 'json-to-xml',
    title: 'JSON to XML',
    category: 'JSON',
    href: '/json-to-xml',
    description: 'Convert JSON into XML with elements, attributes, and text nodes.',
    output: 'xml',
  },
  {
    id: 'json-to-struct',
    title: 'JSON to Struct',
    category: 'JSON',
    href: '/json-to-struct',
    description: 'Generate Go structs with JSON tags from your data.',
    output: 'go',
  },
  {
    id: 'xml-to-json',
    title: 'XML to JSON',
    category: 'XML',
    href: '/xml-to-json',
    description: 'Convert XML into readable JSON with attributes and text nodes.',
    output: 'text',
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    category: 'JSON',
    href: '/json-formatter',
    description: 'Pretty-print or minify valid JSON instantly.',
    output: 'text',
  },
  {
    id: 'string-to-json',
    title: 'String to JSON',
    category: 'JSON',
    href: '/string-to-json',
    description: 'Convert escaped JSON strings into readable JSON.',
    output: 'text',
  },
  {
    id: 'json-to-string',
    title: 'JSON to String',
    category: 'JSON',
    href: '/json-to-string',
    description: 'Convert JSON into a safely escaped string.',
    output: 'text',
  },
  {
    id: 'json-fixer',
    title: 'JSON Fixer',
    category: 'JSON',
    href: '/json-fixer',
    description: 'Apply conservative repairs to common JSON syntax mistakes.',
    output: 'text',
  },
  {
    id: 'json-validator',
    title: 'JSON Validator',
    category: 'JSON',
    href: '/json-validator',
    description: 'Check JSON syntax and locate parsing errors.',
    output: 'status',
  },
  {
    id: 'compare-text',
    title: 'Compare Text',
    category: 'Text',
    href: '/compare-text',
    description: 'Compare any two text values line by line.',
    output: 'diff',
  },
] as const

export type ToolId = (typeof tools)[number]['id']
export type ToolDefinition = (typeof tools)[number]

export function getTool(id: ToolId) {
  return tools.find((tool) => tool.id === id) as ToolDefinition
}
