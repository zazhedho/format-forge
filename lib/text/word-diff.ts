export type WordDiffSegment = {
  text: string
  type: 'equal' | 'changed'
}

export type WordDiff = {
  left: WordDiffSegment[]
  right: WordDiffSegment[]
}

type TokenOperation =
  | { type: 'equal'; text: string }
  | { type: 'added'; text: string }
  | { type: 'removed'; text: string }

function tokenize(source: string) {
  return source.match(/[\p{L}\p{N}_]+|\s+|[^\p{L}\p{N}\s_]+/gu) ?? []
}

function getOperations(left: string[], right: string[]) {
  // ponytail: O(n*m) token LCS; use Myers diff if very long changed lines require it.
  const table = Array.from(
    { length: left.length + 1 },
    () => Array<number>(right.length + 1).fill(0)
  )

  for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = right.length - 1; rightIndex >= 0; rightIndex -= 1) {
      table[leftIndex][rightIndex] = left[leftIndex] === right[rightIndex]
        ? table[leftIndex + 1][rightIndex + 1] + 1
        : Math.max(table[leftIndex + 1][rightIndex], table[leftIndex][rightIndex + 1])
    }
  }

  const operations: TokenOperation[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length || rightIndex < right.length) {
    if (leftIndex < left.length && rightIndex < right.length && left[leftIndex] === right[rightIndex]) {
      operations.push({ type: 'equal', text: left[leftIndex] })
      leftIndex += 1
      rightIndex += 1
    } else if (
      rightIndex < right.length &&
      (leftIndex === left.length || table[leftIndex][rightIndex + 1] >= table[leftIndex + 1][rightIndex])
    ) {
      operations.push({ type: 'added', text: right[rightIndex] })
      rightIndex += 1
    } else {
      operations.push({ type: 'removed', text: left[leftIndex] })
      leftIndex += 1
    }
  }

  return operations
}

function appendSegment(segments: WordDiffSegment[], text: string, type: WordDiffSegment['type']) {
  if (!text) return
  const previous = segments[segments.length - 1]
  if (previous?.type === type) previous.text += text
  else segments.push({ text, type })
}

export function diffWords(leftSource: string, rightSource: string): WordDiff {
  const left: WordDiffSegment[] = []
  const right: WordDiffSegment[] = []
  const operations = getOperations(tokenize(leftSource), tokenize(rightSource))
  let index = 0

  while (index < operations.length) {
    const operation = operations[index]
    if (operation.type === 'equal') {
      appendSegment(left, operation.text, 'equal')
      appendSegment(right, operation.text, 'equal')
      index += 1
      continue
    }

    let removed = ''
    let added = ''
    while (index < operations.length && operations[index].type !== 'equal') {
      const change = operations[index]
      if (change.type === 'removed') removed += change.text
      else added += change.text
      index += 1
    }
    appendSegment(left, removed, 'changed')
    appendSegment(right, added, 'changed')
  }

  return { left, right }
}
