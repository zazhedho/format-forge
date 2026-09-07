import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-csv')

export default function JsonToCsvPage() {
  return <ToolRoute toolId="json-to-csv" />
}
