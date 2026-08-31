import type { DiffLine, DiffRow } from '@/lib/text/diff'
import { getDiffMarker, type DiffCellTone } from '@/lib/text/diff-markers'
import { diffWords, type WordDiffSegment } from '@/lib/text/word-diff'
import { SparklesIcon } from './icons'

function cellTone(row: DiffRow, side: 'left' | 'right'): DiffCellTone {
  if (row.type === 'equal' || row.type === 'changed') return row.type
  if (row.type === 'added') return side === 'right' ? 'added' : 'empty'
  return side === 'left' ? 'removed' : 'empty'
}

function renderLine(line: DiffLine | undefined, side: 'left' | 'right', segments?: WordDiffSegment[]) {
  if (!segments) return line?.text || '\u00a0'
  if (segments.length === 0) return '\u00a0'
  return segments.map((segment, index) => (
    <span
      key={`${segment.type}-${index}`}
      className={segment.type === 'changed'
        ? `diff-word-highlight diff-word-${side === 'left' ? 'removed' : 'added'}`
        : undefined}
    >
      {segment.text}
    </span>
  ))
}

function DiffCell({ side, line, tone, segments }: { side: 'left' | 'right'; line?: DiffLine; tone: DiffCellTone; segments?: WordDiffSegment[] }) {
  const marker = getDiffMarker(tone)

  return (
    <div className={`diff-cell diff-${tone}`} aria-label={`${side} ${line ? `line ${line.lineNumber}` : 'empty line'}`}>
      <span className="diff-line-number" aria-hidden="true">
        {marker && <span className="diff-line-marker">{marker}</span>}
        <span className="diff-line-number-value">{line?.lineNumber ?? ''}</span>
      </span>
      <span className="diff-line-text">{renderLine(line, side, segments)}</span>
    </div>
  )
}

export function CompareTextView({ rows }: { rows: DiffRow[] }) {
  const changed = rows.filter((row) => row.type === 'changed').length
  const added = rows.filter((row) => row.type === 'added').length
  const removed = rows.filter((row) => row.type === 'removed').length
  const differences = changed + added + removed
  const summary = differences === 0
    ? 'No differences'
    : `${changed} changed · ${added} added · ${removed} removed`

  return (
    <section className="pane compare-diff-pane" aria-label="Text comparison output">
      <div className="pane-header">
        <span>DIFF OUTPUT</span>
        {rows.length > 0 && <span className="compare-diff-summary">{summary}</span>}
      </div>

      {rows.length === 0 ? (
        <div className="compare-empty">
          <SparklesIcon />
          <strong>Comparison will appear here</strong>
          <span>Enter text in both inputs to get started</span>
        </div>
      ) : (
        <div className="compare-diff-scroll">
          <div className="compare-diff-header" aria-hidden="true">
            <span>LEFT</span>
            <span>RIGHT</span>
          </div>
          <div className="compare-diff-rows">
            {rows.map((row, index) => (
              <DiffRowView key={`${row.type}-${index}`} row={row} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function DiffRowView({ row }: { row: DiffRow }) {
  const words = row.type === 'changed'
    ? diffWords(row.left?.text ?? '', row.right?.text ?? '')
    : undefined

  return (
    <div className="compare-diff-row">
      <DiffCell side="left" line={row.left} tone={cellTone(row, 'left')} segments={words?.left} />
      <DiffCell side="right" line={row.right} tone={cellTone(row, 'right')} segments={words?.right} />
    </div>
  )
}
