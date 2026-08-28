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
    id: 'json-formatter',
    title: 'JSON Formatter',
    category: 'JSON',
    href: '/json-formatter',
    description: 'Pretty-print or minify valid JSON instantly.',
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
] as const

export type ToolId = (typeof tools)[number]['id']
export type ToolDefinition = (typeof tools)[number]

export function getTool(id: ToolId) {
  return tools.find((tool) => tool.id === id) as ToolDefinition
}
