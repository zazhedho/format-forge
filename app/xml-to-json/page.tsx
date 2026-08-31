import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'XML to JSON',
  description: 'Convert XML into readable JSON with attributes and text nodes.',
}

export default function XmlToJsonPage() {
  return <ToolRoute toolId="xml-to-json" />
}
