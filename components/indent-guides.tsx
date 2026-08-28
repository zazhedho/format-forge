import type { RefObject } from 'react'

function getIndentLevel(line: string) {
  const indentation = line.match(/^[ \t]*/)?.[0] ?? ''
  return Math.floor(indentation.replace(/\t/g, '  ').length / 2)
}

export function IndentGuides({
  value,
  layerRef,
}: {
  value: string
  layerRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={layerRef} className="indent-guide-layer" aria-hidden="true">
      {value.split('\n').map((line, lineIndex) => (
        <div className="indent-guide-line" key={lineIndex}>
          {Array.from({ length: getIndentLevel(line) }, (_, guideIndex) => (
            <span
              className="indent-guide"
              key={guideIndex}
              style={{ left: `calc(${(guideIndex + 1) * 2}ch - 0.5px)` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
