import type { ClipboardEvent } from 'react'

type Props = { value: string; onChange: (value: string) => void; onUpload: (file: File) => void }

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
  return (
    <section className="pane" aria-labelledby="json-input-label">
      <div className="pane-header"><span id="json-input-label">JSON INPUT</span><label className="file-button">Choose file<input type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = '' }} /></label></div>
      <textarea className="json-editor" value={value} onChange={(event) => onChange(event.target.value)} onPaste={preserveScrollPosition} spellCheck={false} aria-label="JSON input" />
    </section>
  )
}
