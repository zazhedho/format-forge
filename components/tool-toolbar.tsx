import type { ToolId } from '@/lib/tools/registry'
import {
  SparklesIcon,
  UploadIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  MaximizeIcon,
} from './icons'

type Props = {
  toolId: ToolId
  onSample: () => void
  onUpload: () => void
  onClear: () => void
  onCopy: () => void
  onDownload: () => void
  onFormatMode: (mode: 'pretty' | 'minify') => void
  onFullscreen: () => void
  copied?: boolean
  formatMode?: 'pretty' | 'minify'
}

export function ToolToolbar({
  toolId,
  onSample,
  onUpload,
  onClear,
  onCopy,
  onDownload,
  onFormatMode,
  onFullscreen,
  copied = false,
  formatMode = 'pretty',
}: Props) {
  return (
    <div className="tool-toolbar" aria-label="Tool actions">
      <div className="toolbar-section" role="group" aria-label="Input actions">
        <span className="toolbar-label">Input</span>
        <div className="toolbar-group">
          <button className="button button-primary" type="button" onClick={onSample} title="Load sample JSON">
            <SparklesIcon />
            <span>Sample</span>
          </button>
          <button className="button" type="button" onClick={onUpload} title="Upload JSON or text file">
            <UploadIcon />
            <span>Upload</span>
          </button>
          <button className="button button-quiet button-danger" type="button" onClick={onClear} title="Clear editor">
            <TrashIcon />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {toolId !== 'json-validator' && (
        <div className="toolbar-section toolbar-section-output" role="group" aria-label="Output actions">
          <span className="toolbar-label">Output</span>
          <div className="toolbar-group">
            {toolId === 'json-formatter' && (
              <>
                <button
                  className={`button ${formatMode === 'pretty' ? 'button-active' : ''}`}
                  type="button"
                  onClick={() => onFormatMode('pretty')}
                  title="Format with 2-space indentation"
                >
                  Prettify
                </button>
                <button
                  className={`button ${formatMode === 'minify' ? 'button-active' : ''}`}
                  type="button"
                  onClick={() => onFormatMode('minify')}
                  title="Compact single-line JSON"
                >
                  Minify
                </button>
              </>
            )}

            {toolId === 'json-to-table' && (
              <button className="button" type="button" onClick={onFullscreen} title="Toggle fullscreen workbench">
                <MaximizeIcon />
                <span>Fullscreen</span>
              </button>
            )}

            <button
              className={`button ${copied ? 'button-active' : ''}`}
              type="button"
              onClick={onCopy}
              title="Copy output to clipboard"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button className="button" type="button" onClick={onDownload} title="Download output file">
              <DownloadIcon />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
