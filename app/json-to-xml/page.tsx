import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'JSON to XML',
  description: 'Convert JSON into XML with elements, attributes, and text nodes.',
}

export default function JsonToXmlPage() {
  return <ToolRoute toolId="json-to-xml" />
}
