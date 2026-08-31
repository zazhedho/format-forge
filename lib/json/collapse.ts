import type { HighlightedLine } from './highlight'

export function getCollapsibleRanges(lines: HighlightedLine[]) {
  const stack: Array<{ bracket: string; lineNumber: number }> = []
  const ranges = new Map<number, number>()
  const pairs: Record<string, string> = { '}': '{', ']': '[' }

  lines.forEach((line) => {
    line.tokens.forEach((token) => {
      if (token.type !== 'bracket') return
      if (token.value === '{' || token.value === '[') {
        stack.push({ bracket: token.value, lineNumber: line.lineNumber })
        return
      }

      const opening = stack.pop()
      if (opening && pairs[token.value] === opening.bracket && line.lineNumber > opening.lineNumber) {
        ranges.set(opening.lineNumber, line.lineNumber)
      }
    })
  })

  return ranges
}
