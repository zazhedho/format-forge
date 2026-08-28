type Props = { value: string; onChange: (value: string) => void; onUpload: (file: File) => void }

export function JsonEditor({ value, onChange, onUpload }: Props) {
  return (
    <section className="pane" aria-labelledby="json-input-label">
      <div className="pane-header"><span id="json-input-label">JSON INPUT</span><label className="file-button">Choose file<input type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = '' }} /></label></div>
      <textarea className="json-editor" value={value} onChange={(event) => onChange(event.target.value)} spellCheck={false} aria-label="JSON input" />
    </section>
  )
}
