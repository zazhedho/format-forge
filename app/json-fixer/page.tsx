import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-fixer')
export default function JsonFixerPage() { return <ToolRoute toolId="json-fixer" /> }
