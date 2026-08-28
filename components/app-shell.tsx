'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { tools, type ToolId } from '@/lib/tools/registry'
import { ChevronDownIcon, ForgeLogo } from './icons'

type FormatMode = 'pretty' | 'minify'

type ToolSession = {
  source: string
  formatMode: FormatMode
}

type ToolSessionContextValue = {
  sessions: Partial<Record<ToolId, ToolSession>>
  updateSession: (toolId: ToolId, update: Partial<ToolSession>) => void
}

const emptySession: ToolSession = { source: '', formatMode: 'pretty' }
const ToolSessionContext = createContext<ToolSessionContextValue | null>(null)

export function useToolSession(toolId: ToolId) {
  const context = useContext(ToolSessionContext)
  if (!context) throw new Error('useToolSession must be used inside AppShell')

  const session = context.sessions[toolId] ?? emptySession
  return {
    ...session,
    setSource: (source: string) => context.updateSession(toolId, { source }),
    setFormatMode: (formatMode: FormatMode) => context.updateSession(toolId, { formatMode }),
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/\/+$/, '')
  const [sessions, setSessions] = useState<Partial<Record<ToolId, ToolSession>>>({})
  const sessionContext = useMemo<ToolSessionContextValue>(() => ({
    sessions,
    updateSession: (toolId, update) => {
      setSessions((current) => ({
        ...current,
        [toolId]: { ...emptySession, ...current[toolId], ...update },
      }))
    },
  }), [sessions])

  return (
    <ToolSessionContext.Provider value={sessionContext}>
      <div className="app-shell">
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Format Forge home">
            <ForgeLogo />
            <span className="brand-text">format forge</span>
          </Link>
          <nav className="primary-nav" aria-label="Primary navigation">
            <span className="nav-category">JSON Tools</span>
            {tools.map((tool) => {
              const isActive = normalizedPathname === tool.href
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
    </ToolSessionContext.Provider>
  )
}
