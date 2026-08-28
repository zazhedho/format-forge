import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = { title: 'JSON to Table', description: 'Inspect JSON objects and arrays as readable, expandable tables.' }
export default function JsonToTablePage() { return <ToolRoute toolId="json-to-table" /> }
