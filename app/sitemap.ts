import type { MetadataRoute } from 'next'
import { siteConfig } from '../lib/site'
import { tools } from '../lib/tools/registry'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL('/', siteConfig.url).toString() },
    ...tools.map((tool) => ({ url: new URL(`${tool.href}/`, siteConfig.url).toString() })),
  ]
}
