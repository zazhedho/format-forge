import Link from 'next/link'
import type { ReactNode } from 'react'
import { tools } from '@/lib/tools/registry'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Format Forge home">◆ format forge</Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-category">JSON Tools</span>
          {tools.slice(0, 4).map((tool) => <Link key={tool.id} href={tool.href}>{tool.title}</Link>)}
          <details className="more-tools">
            <summary>More Tools</summary>
            <div className="more-tools-menu"><span>More formats coming soon</span></div>
          </details>
        </nav>
      </header>
      {children}
      <footer className="site-footer"><span>Format Forge</span><span>Local-first developer tools</span></footer>
    </div>
  )
}
