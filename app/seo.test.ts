import { describe, expect, it } from 'vitest'
import robots, { dynamic as robotsDynamic } from './robots'
import sitemap, { dynamic as sitemapDynamic } from './sitemap'
import { createToolMetadata, siteConfig } from '../lib/site'
import { tools } from '../lib/tools/registry'

describe('SEO routes', () => {
  it('creates route-specific social and canonical metadata', () => {
    expect(createToolMetadata('json-formatter')).toMatchObject({
      title: 'JSON Formatter',
      alternates: { canonical: '/json-formatter' },
      openGraph: {
        url: '/json-formatter',
        siteName: 'Format Forge',
        title: 'JSON Formatter',
      },
      twitter: { card: 'summary', title: 'JSON Formatter' },
    })
  })

  it('marks metadata routes as static for static export', () => {
    expect(robotsDynamic).toBe('force-static')
    expect(sitemapDynamic).toBe('force-static')
  })

  it('allows indexing and points crawlers to the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
    })
  })

  it('includes the homepage and every registered tool in the sitemap', () => {
    expect(sitemap()).toEqual([
      { url: new URL('/', siteConfig.url).toString() },
      ...tools.map((tool) => ({ url: new URL(`${tool.href}/`, siteConfig.url).toString() })),
    ])
  })
})
