import type { ToolId } from '@/lib/tools/registry'

type Props = {
  toolId: ToolId
  onSample: () => void
  onUpload: () => void
  onClear: () => void
  onCopy: () => void
  onDownload: () => void
  onFormatMode: (mode: 'pretty' | 'minify') => void
  onFullscreen: () => void
}

export function ToolToolbar({ toolId, onSample, onUpload, onClear, onCopy, onDownload, onFormatMode, onFullscreen }: Props) {
  return (
    <div className="tool-toolbar" aria-label="Tool actions">
      <div className="toolbar-section" role="group" aria-label="Input actions">
        <span className="toolbar-label">Input</span>
        <div className="toolbar-group">
          <button className="button button-primary" type="button" onClick={onSample}>Sample</button>
          <button className="button" type="button" onClick={onUpload}>Upload</button>
          <button className="button button-quiet" type="button" onClick={onClear}>Clear</button>
        </div>
      </div>
      {toolId !== 'json-validator' && <div className="toolbar-section toolbar-section-output" role="group" aria-label="Output actions">
        <span className="toolbar-label">Output</span>
        <div className="toolbar-group">
          {toolId === 'json-formatter' && <><button className="button" type="button" onClick={() => onFormatMode('pretty')}>Prettify</button><button className="button" type="button" onClick={() => onFormatMode('minify')}>Minify</button></>}
          {toolId === 'json-to-table' && <button className="button" type="button" onClick={onFullscreen}>Fullscreen</button>}
          <button className="button" type="button" onClick={onCopy}>Copy</button>
          <button className="button" type="button" onClick={onDownload}>Download</button>
        </div>
      </div>}
    </div>
  )
}
