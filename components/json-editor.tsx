'use client'

import { useLayoutEffect, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent } from 'react'
import { UploadIcon } from './icons'

type Props = {
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => void
  placeholder?: string
}

function preserveScrollPosition(event: ClipboardEvent<HTMLTextAreaElement>) {
  const textarea = event.currentTarget
  const scrollTop = textarea.scrollTop
  const scrollLeft = textarea.scrollLeft
  window.requestAnimationFrame(() => {
    textarea.scrollTop = scrollTop
    textarea.scrollLeft = scrollLeft
  })
}

export function JsonEditor({ value, onChange, onUpload, placeholder = 'Paste or type JSON here, or drag and drop a .json file...' }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const gutterRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  // Compute live line count and stats
  const lineCount = Math.max(1, value.split('\n').length)
  const byteSize = new Blob([value]).size
  const formattedSize =
    byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`

  useLayoutEffect(() => {
    const measure = measureRef.current
    const gutter = gutterRef.current
    if (!measure || !gutter) return

    const syncLineHeights = () => {
      const measuredLines = measure.querySelectorAll<HTMLElement>('.measure-line')
      const gutterLines = gutter.querySelectorAll<HTMLElement>('.gutter-line')
      gutterLines.forEach((gutterLine, index) => {
        const height = measuredLines[index]?.getBoundingClientRect().height ?? 22
        gutterLine.style.height = `${height}px`
        gutterLine.style.lineHeight = '22px'
      })
    }

    syncLineHeights()
    const observer = new ResizeObserver(syncLineHeights)
    observer.observe(measure)
    return () => observer.disconnect()
  }, [value])

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = event.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const updated = value.substring(0, start) + '  ' + value.substring(end)
      onChange(updated)
      window.requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }

  function handleScroll() {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  return (
    <section className="pane" aria-labelledby="json-input-label">
      <div className="pane-header">
        <div className="pane-title">
          <span id="json-input-label">JSON INPUT</span>
          {value && (
            <span className="pane-meta">
              <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
              <span>·</span>
              <span>{formattedSize}</span>
            </span>
          )}
        </div>
      </div>
      <div
        className="editor-wrapper"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drop-overlay">
            <UploadIcon style={{ width: 32, height: 32 }} />
            <span>Drop JSON file to load</span>
          </div>
        )}
        <div className="editor-container">
          <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="gutter-line">
                {i + 1}
              </div>
            ))}
          </div>
          <div ref={measureRef} className="input-line-measure" aria-hidden="true">
            {value.split('\n').map((line, index) => (
              <div key={index} className="measure-line">
                {line || '\u200b'}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="json-editor scroller"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onPaste={preserveScrollPosition}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            wrap="soft"
            aria-label="JSON input"
            placeholder={placeholder}
          />
        </div>
      </div>
    </section>
  )
}
