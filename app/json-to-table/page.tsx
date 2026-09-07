import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-to-table')
export default function JsonToTablePage() { return <ToolRoute toolId="json-to-table" /> }
