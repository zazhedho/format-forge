export function getInsertIndex(rowMiddles: number[], pointerY: number) {
  return rowMiddles.filter((middle) => middle < pointerY).length
}

export function previewOrder(ids: string[], draggedId: string, insertIndex: number) {
  if (!ids.includes(draggedId)) return ids
  const others = ids.filter((id) => id !== draggedId)
  others.splice(insertIndex, 0, draggedId)
  return others
}

export function getMoveTarget(ids: string[], draggedId: string) {
  const index = ids.indexOf(draggedId)
  if (index < 0 || ids.length < 2) return null
  return index > 0
    ? { targetId: ids[index - 1]!, after: true }
    : { targetId: ids[1]!, after: false }
}

export function moveItemNextTo<T extends { id: string }>(items: T[], id: string, targetId: string, after: boolean) {
  if (id === targetId) return items
  const sourceIndex = items.findIndex((item) => item.id === id)
  if (sourceIndex < 0 || !items.some((item) => item.id === targetId)) return items
  const next = [...items]
  const [item] = next.splice(sourceIndex, 1)
  const targetIndex = next.findIndex((entry) => entry.id === targetId)
  next.splice(targetIndex + Number(after), 0, item!)
  return next
}

export function reconcileOrder(order: string[], ids: string[]) {
  const existing = new Set(ids)
  const kept = order.filter((id) => existing.has(id))
  const keptIds = new Set(kept)
  return [...kept, ...ids.filter((id) => !keptIds.has(id))]
}
