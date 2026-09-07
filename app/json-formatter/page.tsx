import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-formatter')
export default function JsonFormatterPage() { return <ToolRoute toolId="json-formatter" /> }
