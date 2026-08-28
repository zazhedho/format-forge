import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = { title: 'JSON Formatter', description: 'Pretty-print or minify valid JSON instantly.' }
export default function JsonFormatterPage() { return <ToolRoute toolId="json-formatter" /> }
