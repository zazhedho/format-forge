import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-xml')

export default function JsonToXmlPage() {
  return <ToolRoute toolId="json-to-xml" />
}
