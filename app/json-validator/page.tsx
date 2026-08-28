import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = { title: 'JSON Validator', description: 'Check JSON syntax and locate parsing errors.' }
export default function JsonValidatorPage() { return <ToolRoute toolId="json-validator" /> }
