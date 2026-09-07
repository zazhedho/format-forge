import { ToolRoute } from '@/components/tool-route'
import { createToolMetadata } from '@/lib/site'

export const metadata = createToolMetadata('json-validator')
export default function JsonValidatorPage() { return <ToolRoute toolId="json-validator" /> }
