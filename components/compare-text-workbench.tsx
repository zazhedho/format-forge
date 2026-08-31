'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { comparisonSamples, samples } from '@/lib/tools/samples'
import { compareText, type DiffRow } from '@/lib/text/diff'
import { useToolSession } from './app-shell'
import { CompareTextView } from './compare-text-view'
import { JsonEditor } from './json-editor'
import { CheckIcon, CopyIcon, DownloadIcon, SparklesIcon, TrashIcon, UploadIcon } from './icons'

function formatDiff(rows: DiffRow[]) {
  return rows.map((row) => {
    if (row.type === 'changed') return `- ${row.left?.text ?? ''}\n+ ${row.right?.text ?? ''}`
    const line = row.left ?? row.right
    const prefix = row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' '
    return `${prefix} ${line?.text ?? ''}`
  }).join('\n')
}

export function CompareTextWorkbench() {
  const {
    source: leftSource,
    setSource: setLeftSource,
    comparisonSource: rightSource,
    setComparisonSource: setRightSource,
  } = useToolSession('compare-text')
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)
  const leftFileInput = useRef<HTMLInputElement>(null)
  const rightFileInput = useRef<HTMLInputElement>(null)
  const rows = useMemo(() => compareText(leftSource, rightSource), [leftSource, rightSource])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => {
      setNotice('')
      setCopied(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [notice])

  function loadSample() {
    setLeftSource(samples['compare-text'])
    setRightSource(comparisonSamples['compare-text'])
  }

  async function loadFile(file: File, side: 'left' | 'right') {
    try {
      const content = await file.text()
      if (side === 'left') setLeftSource(content)
      else setRightSource(content)
      setNotice(`Loaded ${file.name}`)
    } catch {
      setNotice('Could not read file')
    }
  }

  async function copyDiff() {
    const content = formatDiff(rows)
    if (!content) {
      setNotice('Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setNotice('Copied to clipboard!')
    } catch {
      setNotice('Clipboard unavailable')
    }
  }

  function downloadDiff() {
    const content = formatDiff(rows)
    if (!content) {
      setNotice('Nothing to download')
      return
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'compare-text.diff'
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotice('Downloaded as .diff')
  }

  return (
    <div className="workbench compare-workbench" data-tool-id="compare-text">
      <div className="tool-toolbar" aria-label="Compare Text actions">
        <div className="toolbar-section" role="group" aria-label="Compare input actions">
          <h1 className="tool-title">Compare Text</h1>
          <span className="toolbar-label">Inputs</span>
          <div className="toolbar-group">
            <button className="button button-primary" type="button" onClick={loadSample} title="Load sample text">
              <SparklesIcon />
              <span>Sample</span>
            </button>
            <button className="button" type="button" onClick={() => leftFileInput.current?.click()} title="Upload left text file">
              <UploadIcon />
              <span>Upload Left</span>
            </button>
            <button className="button" type="button" onClick={() => rightFileInput.current?.click()} title="Upload right text file">
              <UploadIcon />
              <span>Upload Right</span>
            </button>
            <button className="button button-quiet button-danger" type="button" onClick={() => { setLeftSource(''); setRightSource('') }} title="Clear both inputs">
              <TrashIcon />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="toolbar-section toolbar-section-output" role="group" aria-label="Compare output actions">
          <span className="toolbar-label">Diff</span>
          <div className="toolbar-group">
            <button className={`button ${copied ? 'button-active' : ''}`} type="button" onClick={() => void copyDiff()} title="Copy text diff">
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button className="button" type="button" onClick={downloadDiff} title="Download text diff">
              <DownloadIcon />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <input
        ref={leftFileInput}
        className="visually-hidden"
        type="file"
        accept=".txt,.json,.xml,.csv,.sql,text/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void loadFile(file, 'left')
          event.currentTarget.value = ''
        }}
      />
      <input
        ref={rightFileInput}
        className="visually-hidden"
        type="file"
        accept=".txt,.json,.xml,.csv,.sql,text/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void loadFile(file, 'right')
          event.currentTarget.value = ''
        }}
      />

      {notice && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="action-notice">
            <CheckIcon style={{ width: 14, height: 14, color: 'var(--accent-emerald)' }} />
            <span>{notice}</span>
          </div>
        </div>
      )}

      <div className="compare-workspace">
        <div className="compare-inputs">
          <JsonEditor
            value={leftSource}
            onChange={setLeftSource}
            onUpload={(file) => void loadFile(file, 'left')}
            label="LEFT TEXT"
            ariaLabel="Left text input"
            placeholder="Paste first text here..."
            dropLabel="Drop text file to load"
          />
          <JsonEditor
            value={rightSource}
            onChange={setRightSource}
            onUpload={(file) => void loadFile(file, 'right')}
            label="RIGHT TEXT"
            ariaLabel="Right text input"
            placeholder="Paste second text here..."
            dropLabel="Drop text file to load"
          />
        </div>
        <CompareTextView rows={rows} />
      </div>
    </div>
  )
}
