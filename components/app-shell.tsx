'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { tools, type ToolId } from '@/lib/tools/registry'
import { ChevronDownIcon, ForgeLogo } from './icons'

type FormatMode = 'pretty' | 'minify'

type ToolSession = {
  source: string
  comparisonSource: string
  formatMode: FormatMode
}

type ToolSessionContextValue = {
  sessions: Partial<Record<ToolId, ToolSession>>
  updateSession: (toolId: ToolId, update: Partial<ToolSession>) => void
}

const emptySession: ToolSession = { source: '', comparisonSource: '', formatMode: 'pretty' }
const ToolSessionContext = createContext<ToolSessionContextValue | null>(null)

export function useToolSession(toolId: ToolId) {
  const context = useContext(ToolSessionContext)
  if (!context) throw new Error('useToolSession must be used inside AppShell')

  const session = context.sessions[toolId] ?? emptySession
  return {
    ...session,
    comparisonSource: session.comparisonSource ?? '',
    setSource: (source: string) => context.updateSession(toolId, { source }),
    setComparisonSource: (comparisonSource: string) => context.updateSession(toolId, { comparisonSource }),
    setFormatMode: (formatMode: FormatMode) => context.updateSession(toolId, { formatMode }),
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/\/+$/, '')
  const [sessions, setSessions] = useState<Partial<Record<ToolId, ToolSession>>>({})
  const moreToolsRef = useRef<HTMLDetailsElement>(null)
  const sessionContext = useMemo<ToolSessionContextValue>(() => ({
    sessions,
    updateSession: (toolId, update) => {
      setSessions((current) => ({
        ...current,
        [toolId]: { ...emptySession, ...current[toolId], ...update },
      }))
    },
  }), [sessions])

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const menu = moreToolsRef.current
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = moreToolsRef.current
      if (event.key === 'Escape' && menu?.open) {
        menu.open = false
        menu.querySelector<HTMLElement>('summary')?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

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
            {tools.filter((tool) => tool.id !== 'json-to-csv' && tool.id !== 'json-to-yaml' && tool.id !== 'json-to-xml' && tool.id !== 'xml-to-json' && tool.id !== 'json-to-struct').map((tool) => {
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
            <details ref={moreToolsRef} className="more-tools">
              <summary>
                <span>More Tools</span>
                <ChevronDownIcon />
              </summary>
              <div className="more-tools-menu" onClick={() => { moreToolsRef.current?.removeAttribute('open') }}>
                <span className="more-tools-section">Converters</span>
                <Link
                  href="/json-to-yaml"
                  className={`more-tools-item ${normalizedPathname === '/json-to-yaml' ? 'active' : ''}`}
                  aria-current={normalizedPathname === '/json-to-yaml' ? 'page' : undefined}
                >
                  <span>JSON to YAML</span>
                </Link>
                <Link
                  href="/json-to-xml"
                  className={`more-tools-item ${normalizedPathname === '/json-to-xml' ? 'active' : ''}`}
                  aria-current={normalizedPathname === '/json-to-xml' ? 'page' : undefined}
                >
                  <span>JSON to XML</span>
                </Link>
                <Link
                  href="/xml-to-json"
                  className={`more-tools-item ${normalizedPathname === '/xml-to-json' ? 'active' : ''}`}
                  aria-current={normalizedPathname === '/xml-to-json' ? 'page' : undefined}
                >
                  <span>XML to JSON</span>
                </Link>
                <Link
                  href="/json-to-csv"
                  className={`more-tools-item ${normalizedPathname === '/json-to-csv' ? 'active' : ''}`}
                  aria-current={normalizedPathname === '/json-to-csv' ? 'page' : undefined}
                >
                  <span>JSON to CSV</span>
                </Link>
                <span className="more-tools-section">Code Generation</span>
                <Link
                  href="/json-to-struct"
                  className={`more-tools-item ${normalizedPathname === '/json-to-struct' ? 'active' : ''}`}
                  aria-current={normalizedPathname === '/json-to-struct' ? 'page' : undefined}
                >
                  <span>JSON to Struct</span>
                </Link>
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
