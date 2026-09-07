import type { Metadata } from 'next'
import { getTool, type ToolId } from './tools/registry'

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const siteConfig = {
  name: 'Format Forge',
  description: 'Local-first developer tools for formatting, validating, comparing, and transforming JSON, XML, YAML, CSV, and text.',
  url: (configuredUrl || 'https://jsonformatter.imyourz.com').replace(/\/+$/, ''),
} as const

export function createPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: path,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: { card: 'summary', title, description },
  }
}

export function createToolMetadata(toolId: ToolId): Metadata {
  const tool = getTool(toolId)
  return createPageMetadata(tool.title, tool.description, tool.href)
}
