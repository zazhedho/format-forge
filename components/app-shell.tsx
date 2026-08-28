'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { tools } from '@/lib/tools/registry'
import { ChevronDownIcon, ForgeLogo } from './icons'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Format Forge home">
          <ForgeLogo />
          <span className="brand-text">format forge</span>
          <span className="brand-badge">v0.1</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-category">JSON Tools</span>
          {tools.map((tool) => {
            const isActive = pathname === tool.href
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tool.title}
              </Link>
            )
          })}
          <details className="more-tools">
            <summary>
              <span>More Tools</span>
              <ChevronDownIcon />
            </summary>
            <div className="more-tools-menu">
              <span className="more-tools-section">Converters</span>
              <div className="more-tools-item">
                <span>JSON to YAML</span>
                <span className="badge-upcoming">Soon</span>
              </div>
              <div className="more-tools-item">
                <span>JSON to CSV</span>
                <span className="badge-upcoming">Soon</span>
              </div>
              <span className="more-tools-section">Encoding</span>
              <div className="more-tools-item">
                <span>Base64 / JWT</span>
                <span className="badge-upcoming">Soon</span>
              </div>
            </div>
          </details>
        </nav>
        <div className="header-meta">
          <span className="privacy-badge">
            <span className="privacy-dot" />
            Local-First
          </span>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>Format Forge · Local-First Developer Tools</span>
          </div>
          <div className="footer-right">
            <span>Zero Data Uploaded</span>
            <span>·</span>
            <span>100% Client-Side</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
