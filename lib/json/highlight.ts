export type TokenType =
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'bracket'
  | 'punct'
  | 'whitespace'
  | 'text'

export type Token = {
  type: TokenType
  value: string
}

export type HighlightedLine = {
  lineNumber: number
  indentCount: number
  tokens: Token[]
}

const TOKEN_REGEX =
  /("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\]])|([,:])|(\s+)|([^\s"'{}[\]:,]+)/g

export function highlightJsonLine(lineText: string, lineNumber: number, indentSize = 2): HighlightedLine {
  // Extract leading indentation
  const indentMatch = lineText.match(/^(\s*)/)
  const leadingSpaces = indentMatch ? indentMatch[1] : ''
  const indentCount = Math.floor(leadingSpaces.length / indentSize)
  const content = lineText.slice(leadingSpaces.length)

  const tokens: Token[] = []
  let match: RegExpExecArray | null

  TOKEN_REGEX.lastIndex = 0

  while ((match = TOKEN_REGEX.exec(content)) !== null) {
    const [
      full,
      stringVal,
      numVal,
      boolVal,
      nullVal,
      bracketVal,
      punctVal,
      wsVal,
      textVal,
    ] = match

    if (stringVal !== undefined) {
      // Check if this string is a JSON key (followed by optional whitespace and a colon)
      const afterIndex = TOKEN_REGEX.lastIndex
      const remainder = content.slice(afterIndex)
      const isKey = /^\s*:/.test(remainder)

      tokens.push({
        type: isKey ? 'key' : 'string',
        value: stringVal,
      })
    } else if (numVal !== undefined) {
      tokens.push({ type: 'number', value: numVal })
    } else if (boolVal !== undefined) {
      tokens.push({ type: 'boolean', value: boolVal })
    } else if (nullVal !== undefined) {
      tokens.push({ type: 'null', value: nullVal })
    } else if (bracketVal !== undefined) {
      tokens.push({ type: 'bracket', value: bracketVal })
    } else if (punctVal !== undefined) {
      tokens.push({ type: 'punct', value: punctVal })
    } else if (wsVal !== undefined) {
      tokens.push({ type: 'whitespace', value: wsVal })
    } else if (textVal !== undefined) {
      tokens.push({ type: 'text', value: textVal })
    }
  }

  return {
    lineNumber,
    indentCount,
    tokens,
  }
}

export function highlightJson(jsonString: string, indentSize = 2): HighlightedLine[] {
  if (!jsonString) return []
  const lines = jsonString.split('\n')
  return lines.map((line, index) => highlightJsonLine(line, index + 1, indentSize))
}
