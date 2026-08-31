'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { samples } from '@/lib/tools/samples'
import { copyText, downloadData } from '@/lib/tools/output'
import { runTool } from '@/lib/tools/run-tool'
import { parseJson } from '@/lib/json/parse'
import type { ToolId } from '@/lib/tools/registry'
import { JsonEditor } from './json-editor'
import { StatusMessage } from './status-message'
import { TableView } from './table-view'
import { TextOutput } from './text-output'
import { ToolToolbar } from './tool-toolbar'
import { useToolSession } from './app-shell'
import {
  ShieldCheckIcon,
  AlertCircleIcon,
  CheckIcon,
  MinimizeIcon,
} from './icons'

export function ToolWorkbench({ toolId }: { toolId: ToolId }) {
  const { source, setSource, formatMode, setFormatMode } = useToolSession(toolId)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const result = useMemo(
    () => runTool(toolId, source, { formatMode }),
    [toolId, source, formatMode]
  )
  const hasSource = source.trim().length > 0

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  // Auto-dismiss toast notice after 3 seconds
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => {
      setNotice('')
      setCopied(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [notice])

  async function copyOutput() {
    const content = copyText(result)
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

  function downloadOutput() {
    const download = downloadData(result)
    if (!download) {
      setNotice('Nothing to download')
      return
    }
    const blob = new Blob([download.content], { type: download.type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${toolId}.${download.extension}`
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotice(`Downloaded as .${download.extension}`)
  }

  async function loadFile(file: File) {
    try {
      const nextSource = await file.text()
      setSource(nextSource)
      setNotice(`Loaded ${file.name}`)
    } catch {
      setNotice('Could not read file')
    }
  }

  // Calculate parsed JSON info for Validator
  const parsedData = useMemo(() => {
    if (!source.trim()) return null
    return parseJson(source)
  }, [source])

  return (
    <div
      className={fullscreen ? 'workbench workbench-fullscreen' : 'workbench'}
      data-tool-id={toolId}
    >
      {fullscreen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-default)',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Fullscreen Mode · Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-input)', borderRadius: '4px', border: '1px solid var(--border-default)' }}>ESC</kbd> to exit
          </span>
          <button
            className="button"
            type="button"
            onClick={() => setFullscreen(false)}
            title="Exit fullscreen"
          >
            <MinimizeIcon />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      )}

      <ToolToolbar
        toolId={toolId}
        onSample={() => setSource(samples[toolId])}
        onUpload={() => fileInput.current?.click()}
        onClear={() => setSource('')}
        onCopy={() => void copyOutput()}
        onDownload={downloadOutput}
        onFormatMode={setFormatMode}
        onFullscreen={() => setFullscreen(true)}
        copied={copied}
        formatMode={formatMode}
      />

      <input
        ref={fileInput}
        className="visually-hidden"
        type="file"
        accept=".json,.txt,application/json,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void loadFile(file)
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

      <div className="workspace-panels">
        <JsonEditor
          value={source}
          onChange={setSource}
          onUpload={(file) => void loadFile(file)}
          placeholder={toolId === 'string-to-json' ? 'Enter an escaped JSON string here...' : toolId === 'json-to-string' ? 'Enter JSON here...' : undefined}
        />

        <section className="pane output-pane" aria-label="Tool output" aria-live="polite">
          <div className="pane-header">
            <span>OUTPUT</span>
            {hasSource && !(result.ok && result.output.kind === 'status') && (
              <StatusMessage error={result.ok ? undefined : result.error} />
            )}
          </div>

          {result.ok && result.output.kind === 'table' && (
            <TableView model={result.output.model} />
          )}

          {result.ok && (result.output.kind === 'text' || result.output.kind === 'csv') && (
            <TextOutput
              value={result.output.value}
              warnings={result.output.warnings}
              collapsible={toolId === 'json-formatter'}
              ariaLabel={toolId === 'json-to-csv' ? 'CSV output' : undefined}
            />
          )}

          {result.ok && result.output.kind === 'status' && (
            <div className="validator-valid-card">
              <div className="validator-icon-wrap">
                <ShieldCheckIcon style={{ width: 32, height: 32 }} />
              </div>
              <h2>Valid JSON</h2>
              <p>Your JSON syntax is completely valid and ready to use.</p>

              {parsedData && parsedData.ok && (
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 20,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <span className="hero-pill">
                    Type: {Array.isArray(parsedData.value) ? `Array (${parsedData.value.length} items)` : typeof parsedData.value === 'object' && parsedData.value !== null ? `Object (${Object.keys(parsedData.value).length} keys)` : typeof parsedData.value}
                  </span>
                  <span className="hero-pill">
                    Size: {new Blob([source]).size} bytes
                  </span>
                </div>
              )}
            </div>
          )}

          {hasSource && !result.ok && (
            <div className="error-output-card">
              <div className="error-card-box">
                <div className="error-card-header">
                  <AlertCircleIcon />
                  <span>Parsing Error</span>
                </div>
                <p className="error-message-text">{result.error.message}</p>
                {result.error.line && result.error.column && (
                  <div className="error-location-tag">
                    Line {result.error.line}, Column {result.error.column}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
