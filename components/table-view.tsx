'use client'

import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { getExpandablePaths, searchTableModel } from '@/lib/json/table-search'
import { toTableModel } from '@/lib/json/table'
import type { JsonValue, TableCell, TableModel } from '@/lib/json/types'

function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null
}

function displayValue(value: JsonValue) {
  if (typeof value === 'string') return value
  if (value === null) return 'null'
  if (isContainer(value)) return Array.isArray(value) ? `Array (${value.length})` : `Object (${Object.keys(value).length})`
  return String(value)
}

function relatedToMatch(path: string, query: string, matches: Set<string>) {
  if (!query) return true
  return [...matches].some((match) => match === path || match.startsWith(`${path}.`) || match.startsWith(`${path}[`) || path.startsWith(`${match}.`) || path.startsWith(`${match}[`))
}

type NodeProps = { model: TableModel; expanded: Set<string>; matches: Set<string>; query: string; toggle: (path: string) => void }

function CellView({ cell, expanded, matches, query, toggle }: { cell: TableCell; expanded: Set<string>; matches: Set<string>; query: string; toggle: (path: string) => void }) {
  if (!isContainer(cell.value)) return <span data-match={matches.has(cell.path) ? 'true' : undefined}>{displayValue(cell.value)}</span>
  const open = expanded.has(cell.path)
  return <div className="nested-cell"><button className="disclosure" type="button" aria-expanded={open} onClick={() => toggle(cell.path)}>{open ? '⌄' : '›'} {displayValue(cell.value)}</button>{open && <div className="nested-table"><TableNode model={toTableModel(cell.value, cell.path)} expanded={expanded} matches={matches} query={query} toggle={toggle} /></div>}</div>
}

function TableNode({ model, expanded, matches, query, toggle }: NodeProps): ReactElement {
  if (model.kind === 'scalar') return <span data-match={matches.has(model.cell.path) ? 'true' : undefined}>{displayValue(model.cell.value)}</span>
  if (model.kind === 'key-value') {
    const rows = model.rows.filter((row) => relatedToMatch(row.path, query, matches))
    return <table className="result-table"><caption className="visually-hidden">JSON key value table</caption><thead><tr><th>key</th><th>value</th></tr></thead><tbody>{rows.map((row) => <tr key={row.path}><td data-match={matches.has(row.path) ? 'true' : undefined}>{row.key}</td><td><CellView cell={row.cell} expanded={expanded} matches={matches} query={query} toggle={toggle} /></td></tr>)}</tbody></table>
  }

  const rows = model.rows.filter((row) => relatedToMatch(row.path, query, matches))
  return <table className="result-table"><caption className="visually-hidden">JSON records table</caption><thead><tr>{model.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.path}>{model.columns.map((column) => <td key={`${row.path}.${column}`}>{row.cells[column] ? <CellView cell={row.cells[column] as TableCell} expanded={expanded} matches={matches} query={query} toggle={toggle} /> : '—'}</td>)}</tr>)}</tbody></table>
}

export function TableView({ model }: { model: TableModel }): ReactElement {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const search = useMemo(() => searchTableModel(model, query), [model, query])
  const matches = useMemo(() => new Set(search.matches), [search.matches])
  const expandable = useMemo(() => getExpandablePaths(model), [model])

  useEffect(() => {
    if (!query) return
    setExpanded((current) => new Set([...current, ...expandable.filter((path) => [...matches].some((match) => match === path || match.startsWith(`${path}.`) || match.startsWith(`${path}[`)))]))
  }, [expandable, matches, query])

  const toggle = (path: string) => setExpanded((current) => { const next = new Set(current); next.has(path) ? next.delete(path) : next.add(path); return next })
  const expandAll = () => setExpanded(new Set(expandable))
  const collapseAll = () => setExpanded(new Set())

  return <div className="table-output"><div className="table-controls"><label>Search table <input className="table-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Key, value, or path" /></label>{expandable.length > 0 && <div className="table-actions"><button className="button" type="button" onClick={expandAll}>Expand all</button><button className="button" type="button" onClick={collapseAll}>Collapse all</button></div>}</div>{search.model ? <div className="table-scroll"><TableNode model={search.model} expanded={expanded} matches={matches} query={query} toggle={toggle} /></div> : <p className="empty-table">No matching values.</p>}</div>
}
