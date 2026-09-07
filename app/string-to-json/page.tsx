import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('string-to-json')

export default function StringToJsonPage() {
  return <ToolRoute toolId="string-to-json" />
}
