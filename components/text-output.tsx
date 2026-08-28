'use client'

import { useLayoutEffect, useRef, useMemo, type KeyboardEvent, type FormEvent, type ClipboardEvent, type DragEvent } from 'react'
import { highlightJson } from '@/lib/json/highlight'
import { CheckIcon, InfoIcon } from './icons'

export function TextOutput({
  value,
  warnings = [],
}: {
  value: string
  warnings?: string[]
}) {
  const gutterRef = useRef<HTMLDivElement>(null)
  const codeAreaRef = useRef<HTMLDivElement>(null)

  const highlightedLines = useMemo(() => highlightJson(value), [value])
  const lineCount = highlightedLines.length > 0 ? highlightedLines.length : (value ? value.split('\n').length : 1)

  useLayoutEffect(() => {
    const codeArea = codeAreaRef.current
    const gutter = gutterRef.current
    if (!codeArea || !gutter) return

    const syncLineHeights = () => {
      const codeLines = codeArea.querySelectorAll<HTMLElement>('.code-line')
      const gutterLines = gutter.querySelectorAll<HTMLElement>('.gutter-line')
      gutterLines.forEach((gutterLine, index) => {
        const height = codeLines[index]?.getBoundingClientRect().height ?? 22
        gutterLine.style.height = `${height}px`
        gutterLine.style.lineHeight = '22px'
      })
    }

    syncLineHeights()
    const observer = new ResizeObserver(syncLineHeights)
    observer.observe(codeArea)
    return () => observer.disconnect()
  }, [highlightedLines])

  function handleScroll() {
    if (gutterRef.current && codeAreaRef.current) {
      gutterRef.current.scrollTop = codeAreaRef.current.scrollTop
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    // Allow navigation keys and shortcut combinations
    const allowedNavigationKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ]

    if (allowedNavigationKeys.includes(e.key)) {
      return
    }

    // Allow Cmd/Ctrl + C (copy), Cmd/Ctrl + A (select all)
    if ((e.metaKey || e.ctrlKey) && ['c', 'a'].includes(e.key.toLowerCase())) {
      return
    }

    // Prevent modifying the read-only formatted output
    e.preventDefault()
  }

  function handleBeforeInput(e: FormEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  return (
    <div className="text-output">
      <div className="output-stage">
        <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="gutter-line">
              {i + 1}
            </div>
          ))}
        </div>

        <div
          ref={codeAreaRef}
          className="output-code-area scroller"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onScroll={handleScroll}
          spellCheck={false}
          role="textbox"
          aria-multiline="true"
          aria-readonly="true"
          aria-label="Formatted JSON output"
          tabIndex={0}
        >
          {highlightedLines.map((line) => (
            <div key={line.lineNumber} className="code-line">
              <span className="line-code">
                {Array.from({ length: line.indentCount }).map((_, i) => (
                  <span key={i} className="indent-guide" aria-hidden="true" />
                ))}
                {line.tokens.length > 0 ? (
                  line.tokens.map((token, tokenIdx) => (
                    <span
                      key={tokenIdx}
                      className={`token token-${token.type}`}
                    >
                      {token.value}
                    </span>
                  ))
                ) : (
                  <span className="token-whitespace">&nbsp;</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warnings-box">
          <div className="warnings-title">
            <InfoIcon />
            <span>Repairs Applied</span>
          </div>
          <ul className="warnings-list">
            {warnings.map((warning, index) => (
              <li
                key={`${warning}-${index}`}
                style={{
                  listStyleType: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CheckIcon
                  style={{ width: 12, height: 12, color: 'var(--accent-emerald)' }}
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
