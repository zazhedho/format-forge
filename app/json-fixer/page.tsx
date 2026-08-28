import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = { title: 'JSON Fixer', description: 'Apply conservative repairs to common JSON syntax mistakes.' }
export default function JsonFixerPage() { return <ToolRoute toolId="json-fixer" /> }
