import { useRef, type UIEvent } from 'react'
import { CheckIcon, InfoIcon } from './icons'
import { IndentGuides } from './indent-guides'
import { selectAllContents } from './output-selection'

function handleOutputKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    event.preventDefault()
    selectAllContents(event.currentTarget)
    return
  }

  if (event.ctrlKey || event.metaKey || event.altKey) return

  if (event.key.length === 1 || ['Backspace', 'Delete', 'Enter'].includes(event.key)) {
    event.preventDefault()
  }
}

export function TextOutput({
  value,
  warnings = [],
}: {
  value: string
  warnings?: string[]
}) {
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const guideLayerRef = useRef<HTMLDivElement>(null)
  const lineCount = Math.max(1, value.split('\n').length)

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollLeft, scrollTop } = event.currentTarget
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop
    }
    if (guideLayerRef.current) {
      guideLayerRef.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`
    }
  }

  return (
    <div className="text-output">
      <div className="output-wrapper">
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
          <div
            className="output-content"
            tabIndex={0}
            role="textbox"
            aria-label="JSON output"
            aria-readonly="true"
            contentEditable={true}
            suppressContentEditableWarning
            spellCheck={false}
            onBeforeInput={(event) => event.preventDefault()}
            onPaste={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            onKeyDown={handleOutputKeyDown}
            onScroll={handleScroll}
          >
            {value}
          </div>
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
              <li key={`${warning}-${index}`} style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon style={{ width: 12, height: 12, color: 'var(--accent-emerald)' }} />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
