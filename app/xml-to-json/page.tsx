import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('xml-to-json')

export default function XmlToJsonPage() {
  return <ToolRoute toolId="xml-to-json" />
}
