export type DiffLine = {
  lineNumber: number
  text: string
}

export type DiffRow = {
  type: 'equal' | 'changed' | 'added' | 'removed'
  left?: DiffLine
  right?: DiffLine
}

type Operation =
  | { type: 'equal'; left: DiffLine; right: DiffLine }
  | { type: 'added'; right: DiffLine }
  | { type: 'removed'; left: DiffLine }

function splitLines(source: string) {
  return source ? source.split(/\r?\n/) : []
}

function getOperations(left: string[], right: string[]) {
  // ponytail: O(n*m) LCS; use Myers diff if very large inputs require it.
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

  const operations: Operation[] = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length || rightIndex < right.length) {
    if (leftIndex < left.length && rightIndex < right.length && left[leftIndex] === right[rightIndex]) {
      operations.push({
        type: 'equal',
        left: { lineNumber: leftIndex + 1, text: left[leftIndex] },
        right: { lineNumber: rightIndex + 1, text: right[rightIndex] },
      })
      leftIndex += 1
      rightIndex += 1
    } else if (
      rightIndex < right.length &&
      (leftIndex === left.length || table[leftIndex][rightIndex + 1] >= table[leftIndex + 1][rightIndex])
    ) {
      operations.push({
        type: 'added',
        right: { lineNumber: rightIndex + 1, text: right[rightIndex] },
      })
      rightIndex += 1
    } else {
      operations.push({
        type: 'removed',
        left: { lineNumber: leftIndex + 1, text: left[leftIndex] },
      })
      leftIndex += 1
    }
  }

  return operations
}

function groupOperations(operations: Operation[]) {
  const rows: DiffRow[] = []
  let index = 0

  while (index < operations.length) {
    const operation = operations[index]
    if (operation.type === 'equal') {
      rows.push(operation)
      index += 1
      continue
    }

    const removed: DiffLine[] = []
    const added: DiffLine[] = []
    while (index < operations.length && operations[index].type !== 'equal') {
      const change = operations[index]
      if (change.type === 'removed') removed.push(change.left)
      else added.push(change.right)
      index += 1
    }

    const rowCount = Math.max(removed.length, added.length)
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const left = removed[rowIndex]
      const right = added[rowIndex]
      rows.push({
        type: left && right ? 'changed' : left ? 'removed' : 'added',
        left,
        right,
      })
    }
  }

  return rows
}

export function compareText(leftSource: string, rightSource: string): DiffRow[] {
  const left = splitLines(leftSource)
  const right = splitLines(rightSource)
  if (left.length === 0 && right.length === 0) return []
  return groupOperations(getOperations(left, right))
}
