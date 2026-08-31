import type { Metadata } from 'next'
import { ToolRoute } from '@/components/tool-route'

export const metadata: Metadata = {
  title: 'Compare Text',
  description: 'Compare any two text values line by line.',
}

export default function CompareTextPage() {
  return <ToolRoute toolId="compare-text" />
}
