import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-yaml')

export default function JsonToYamlPage() {
  return <ToolRoute toolId="json-to-yaml" />
}
