'use client'

import { useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type UIEvent } from 'react'
import { IndentGuides } from './indent-guides'
import { UploadIcon, TrashIcon } from './icons'

type Props = {
  value: string
  onChange: (value: string) => void
  onUpload: (file: File) => void
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

export function JsonEditor({ value, onChange, onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const guideLayerRef = useRef<HTMLDivElement>(null)

  // Compute live editor stats
  const lineCount = Math.max(1, value.split('\n').length)
  const charCount = value.length
  const byteSize = new Blob([value]).size
  const formattedSize =
    byteSize > 1024 ? `${(byteSize / 1024).toFixed(1)} KB` : `${byteSize} B`

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

  function handleScroll(event: UIEvent<HTMLTextAreaElement>) {
    const { scrollLeft, scrollTop } = event.currentTarget
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop
    }
    if (guideLayerRef.current) {
      guideLayerRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`
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
        <div className="toolbar-group">
          <label className="file-button" title="Upload JSON file">
            <UploadIcon />
            <span>File</span>
            <input
              type="file"
              accept=".json,.txt,application/json,text/plain"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(file)
                event.currentTarget.value = ''
              }}
            />
          </label>
          {value && (
            <button
              className="button button-quiet button-danger"
              type="button"
              onClick={() => onChange('')}
              title="Clear input"
            >
              <TrashIcon />
            </button>
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
        <div
          ref={lineNumbersRef}
          className="line-number-gutter"
          aria-hidden="true"
          style={{ width: `calc(${Math.max(2, String(lineCount).length)}ch + 20px)` }}
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <div className="code-content-wrapper">
          <IndentGuides value={value} layerRef={guideLayerRef} />
          <textarea
            className="json-editor"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onPaste={preserveScrollPosition}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            wrap="off"
            spellCheck={false}
            aria-label="JSON input"
            placeholder="Paste or type JSON here, or drag and drop a .json file..."
          />
        </div>
      </div>
    </section>
  )
}
