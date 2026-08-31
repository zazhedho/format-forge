export type DiffCellTone = 'equal' | 'changed' | 'added' | 'removed' | 'empty'

export function getDiffMarker(tone: DiffCellTone) {
  if (tone === 'added') return '+'
  if (tone === 'removed') return '−'
  return ''
}
