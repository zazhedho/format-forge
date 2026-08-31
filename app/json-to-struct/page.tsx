import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'JSON to Struct',
  description: 'Generate Go structs with JSON tags from your data.',
}

export default function JsonToStructPage() {
  return <ToolRoute toolId="json-to-struct" />
}
