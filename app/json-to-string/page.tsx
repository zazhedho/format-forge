import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-string')

export default function JsonToStringPage() {
  return <ToolRoute toolId="json-to-string" />
}
