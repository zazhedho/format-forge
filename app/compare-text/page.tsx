import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('compare-text')

export default function CompareTextPage() {
  return <ToolRoute toolId="compare-text" />
}
