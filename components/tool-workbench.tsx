'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { samples } from '@/lib/tools/samples'
import { copyText, downloadData } from '@/lib/tools/output'
import { runTool } from '@/lib/tools/run-tool'
import type { ToolId } from '@/lib/tools/registry'
import { JsonEditor } from './json-editor'
import { StatusMessage } from './status-message'
import { TableView } from './table-view'
import { TextOutput } from './text-output'
import { ToolToolbar } from './tool-toolbar'

export function ToolWorkbench({ toolId }: { toolId: ToolId }) {
  const [source, setSource] = useState(samples[toolId])
  const [formatMode, setFormatMode] = useState<'pretty' | 'minify'>('pretty')
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const result = useMemo(() => runTool(toolId, source, { formatMode }), [toolId, source, formatMode])

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  async function copyOutput() {
    const content = copyText(result)
    if (!content) {
      setNotice('Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(content)
      setNotice('Copied to clipboard')
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
    setNotice('Download started')
  }

  async function loadFile(file: File) {
    try {
      const nextSource = await file.text()
      setSource(nextSource)
      setNotice(`${file.name} loaded`)
    } catch {
      setNotice('Could not read file')
    }
  }

  return (
    <div className={fullscreen ? 'workbench workbench-fullscreen' : 'workbench'}>
      <ToolToolbar toolId={toolId} onSample={() => setSource(samples[toolId])} onUpload={() => fileInput.current?.click()} onClear={() => setSource('')} onCopy={() => void copyOutput()} onDownload={downloadOutput} onFormatMode={setFormatMode} onFullscreen={() => setFullscreen(true)} />
      <input ref={fileInput} className="visually-hidden" type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = '' }} />
      {notice && <p className="action-notice" role="status">{notice}</p>}
      <div className="workspace-panels">
        <JsonEditor value={source} onChange={setSource} onUpload={(file) => void loadFile(file)} />
        <section className="pane output-pane" aria-label="Tool output" aria-live="polite">
          <div className="pane-header"><span>OUTPUT</span>{!(result.ok && result.output.kind === 'status') && <StatusMessage error={result.ok ? undefined : result.error} />}</div>
          {result.ok && result.output.kind === 'table' && <TableView model={result.output.model} />}
          {result.ok && result.output.kind === 'text' && <TextOutput value={result.output.value} warnings={result.output.warnings} />}
          {result.ok && result.output.kind === 'status' && <div className="valid-output"><StatusMessage /></div>}
          {!result.ok && <div className="error-output"><p>Fix the input above to see the result.</p></div>}
        </section>
      </div>
    </div>
  )
}
