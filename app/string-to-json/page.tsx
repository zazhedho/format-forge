import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'String to JSON',
  description: 'Convert escaped JSON strings into readable JSON.',
}

export default function StringToJsonPage() {
  return <ToolRoute toolId="string-to-json" />
}
