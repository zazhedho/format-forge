import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'JSON to YAML',
  description: 'Convert JSON objects and arrays into readable YAML.',
}

export default function JsonToYamlPage() {
  return <ToolRoute toolId="json-to-yaml" />
}
