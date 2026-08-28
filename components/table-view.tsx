'use client'

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { getExpandablePaths, searchTableModel } from '@/lib/json/table-search'
import { toTableModel } from '@/lib/json/table'
import type { JsonValue, TableCell, TableModel } from '@/lib/json/types'
import {
  SearchIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from './icons'
import { selectAllContents } from './output-selection'

function selectTableOnShortcut(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select, a')) return
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    event.preventDefault()
    selectAllContents(event.currentTarget)
    return
  }

  if (event.ctrlKey || event.metaKey || event.altKey) return

  if (event.key.length === 1 || ['Backspace', 'Delete', 'Enter'].includes(event.key)) {
    event.preventDefault()
  }
}

function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null
}

function displayValue(value: JsonValue) {
  if (typeof value === 'string') return `"${value}"`
  if (value === null) return 'null'
  if (isContainer(value)) return Array.isArray(value) ? `Array (${value.length})` : `Object (${Object.keys(value).length})`
  return String(value)
}

function getValueClassName(value: JsonValue): string {
  if (typeof value === 'string') return 'val-string'
  if (typeof value === 'number') return 'val-number'
  if (typeof value === 'boolean') return 'val-boolean'
  if (value === null) return 'val-null'
  return ''
}

function relatedToMatch(path: string, query: string, matches: Set<string>) {
  if (!query) return true
  return [...matches].some(
    (match) =>
      match === path ||
      match.startsWith(`${path}.`) ||
      match.startsWith(`${path}[`) ||
      path.startsWith(`${match}.`) ||
      path.startsWith(`${match}[`)
  )
}

type NodeProps = {
  model: TableModel
  expanded: Set<string>
  matches: Set<string>
  query: string
  toggle: (path: string) => void
}

function CellView({
  cell,
  expanded,
  matches,
  query,
  toggle,
}: {
  cell: TableCell
  expanded: Set<string>
  matches: Set<string>
  query: string
  toggle: (path: string) => void
}) {
  if (!isContainer(cell.value)) {
    const isMatched = matches.has(cell.path)
    const valClass = getValueClassName(cell.value)
    return (
      <span
        data-match={isMatched ? 'true' : undefined}
        className={valClass}
      >
        {displayValue(cell.value)}
      </span>
    )
  }

  const open = expanded.has(cell.path)
  return (
    <div className="nested-cell">
      <button
        className="disclosure"
        type="button"
        aria-expanded={open}
        onClick={() => toggle(cell.path)}
      >
        {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
        <span>{displayValue(cell.value)}</span>
      </button>
      {open && (
        <div className="nested-table">
          <TableNode
            model={toTableModel(cell.value, cell.path)}
            expanded={expanded}
            matches={matches}
            query={query}
            toggle={toggle}
          />
        </div>
      )}
    </div>
  )
}

function TableNode({ model, expanded, matches, query, toggle }: NodeProps): ReactElement {
  if (model.kind === 'scalar') {
    return (
      <span
        data-match={matches.has(model.cell.path) ? 'true' : undefined}
        className={getValueClassName(model.cell.value)}
      >
        {displayValue(model.cell.value)}
      </span>
    )
  }

  if (model.kind === 'key-value') {
    const rows = model.rows.filter((row) => relatedToMatch(row.path, query, matches))
    return (
      <table className="result-table">
        <caption className="visually-hidden">JSON key value table</caption>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.path}>
              <td data-match={matches.has(row.path) ? 'true' : undefined}>{row.key}</td>
              <td>
                <CellView
                  cell={row.cell}
                  expanded={expanded}
                  matches={matches}
                  query={query}
                  toggle={toggle}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const rows = model.rows.filter((row) => relatedToMatch(row.path, query, matches))
  return (
    <table className="result-table">
      <caption className="visually-hidden">JSON records table</caption>
      <thead>
        <tr>
          {model.columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.path}>
            {model.columns.map((column) => (
              <td key={`${row.path}.${column}`}>
                {row.cells[column] ? (
                  <CellView
                    cell={row.cells[column] as TableCell}
                    expanded={expanded}
                    matches={matches}
                    query={query}
                    toggle={toggle}
                  />
                ) : (
                  <span className="val-null">—</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function TableView({ model }: { model: TableModel }): ReactElement {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const search = useMemo(() => searchTableModel(model, query), [model, query])
  const matches = useMemo(() => new Set(search.matches), [search.matches])
  const expandable = useMemo(() => getExpandablePaths(model), [model])

  useEffect(() => {
    if (!query) return
    setExpanded(
      (current) =>
        new Set([
          ...current,
          ...expandable.filter((path) =>
            [...matches].some(
              (match) => match === path || match.startsWith(`${path}.`) || match.startsWith(`${path}[`)
            )
          ),
        ])
    )
  }, [expandable, matches, query])

  const toggle = (path: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })

  const expandAll = () => setExpanded(new Set(expandable))
  const collapseAll = () => setExpanded(new Set())

  return (
    <div className="table-output">
      <div className="table-controls">
        <div className="search-input-wrap">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            className="table-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search key, value, or path..."
            aria-label="Search table"
          />
          {query && (
            <button
              className="search-clear-btn"
              type="button"
              onClick={() => setQuery('')}
              title="Clear search"
              aria-label="Clear search query"
            >
              <XIcon />
            </button>
          )}
        </div>

        {query && matches.size > 0 && (
          <span className="search-count-badge">
            {matches.size} {matches.size === 1 ? 'match' : 'matches'}
          </span>
        )}

        {expandable.length > 0 && (
          <div className="table-actions">
            <button className="button" type="button" onClick={expandAll} title="Expand all nested rows">
              Expand all
            </button>
            <button className="button" type="button" onClick={collapseAll} title="Collapse all nested rows">
              Collapse all
            </button>
          </div>
        )}
      </div>

      {search.model ? (
        <div
          className="table-scroll"
          role="region"
          aria-label="JSON table output"
          aria-readonly="true"
          contentEditable={true}
          tabIndex={0}
          suppressContentEditableWarning
          spellCheck={false}
          onBeforeInput={(event) => event.preventDefault()}
          onPaste={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
          onClick={(event) => {
            if (!(event.target instanceof HTMLElement) || !event.target.closest('button, input, textarea, select, a')) {
              event.currentTarget.focus()
            }
          }}
          onKeyDown={selectTableOnShortcut}
        >
          <TableNode
            model={search.model}
            expanded={expanded}
            matches={matches}
            query={query}
            toggle={toggle}
          />
        </div>
      ) : (
        <div className="empty-table">
          <p>No matching keys or values found for &quot;{query}&quot;.</p>
          <button
            className="button"
            type="button"
            onClick={() => setQuery('')}
            style={{ marginTop: 12 }}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  )
}
