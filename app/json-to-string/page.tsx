import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'JSON to String',
  description: 'Convert JSON into a safely escaped string.',
}

export default function JsonToStringPage() {
  return <ToolRoute toolId="json-to-string" />
}
