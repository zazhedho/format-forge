import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'JSON to CSV',
  description: 'Convert JSON objects and arrays into CSV rows.',
}

export default function JsonToCsvPage() {
  return <ToolRoute toolId="json-to-csv" />
}
