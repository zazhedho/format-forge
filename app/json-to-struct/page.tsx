import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-struct')

export default function JsonToStructPage() {
  return <ToolRoute toolId="json-to-struct" />
}
