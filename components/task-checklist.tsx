'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { addColumn as addChecklistColumn, defaultCheckId, isTaskComplete, readChecklist, removeColumns, type ChecklistData } from '@/lib/tasks/checklist'
import { getInsertIndex, getMoveTarget, moveItemNextTo, previewOrder, reconcileOrder } from '@/lib/tasks/reorder'
import { GripIcon, SparklesIcon, TrashIcon } from './icons'

type ReorderDrag = { id: string; order: string[]; initialOrder: string[] }

// v2 keeps the previous app version's list readable under the old key if this release is rolled back.
const storageKey = 'format-forge:tasks:v2'
const legacyStorageKey = 'format-forge:tasks'

export function useTaskChecklist() {
  const [checklist, setChecklist] = useState<ChecklistData>({ columns: [], tasks: [] })
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey)
      if (stored !== null) setChecklist(readChecklist(JSON.parse(stored)))
    } catch {
      // Keep the checklist empty if browser storage is unavailable or invalid.
    }
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checklist))
    } catch {
      // Checklist still works for this session if browser storage is unavailable.
    }
  }, [checklist, storageReady])

  function loadSample() {
    const fixing = crypto.randomUUID()
    const pr = crypto.randomUUID()
    const merged = crypto.randomUUID()
    const finish = crypto.randomUUID()
    setChecklist({
      columns: [
        { id: fixing, name: 'Fixing' },
        { id: pr, name: 'PR' },
        { id: merged, name: 'Merged' },
        { id: finish, name: 'Finish' },
      ],
      tasks: [{
        id: crypto.randomUUID(),
        title: 'Prepare a report',
        checks: { [fixing]: true, [pr]: false, [merged]: false, [finish]: false },
      }],
    })
  }

  function addTasks(titles: string[]) {
    const newTasks = titles.map((title) => ({ id: crypto.randomUUID(), title }))
    setChecklist((current) => ({
      ...current,
      tasks: [...current.tasks, ...newTasks.map((task) => ({
        ...task,
        checks: current.columns.length
          ? Object.fromEntries(current.columns.map((column) => [column.id, false]))
          : { [defaultCheckId]: false },
      }))],
    }))
  }

  function toggleTask(taskId: string, columnId: string) {
    setChecklist((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId
        ? { ...task, checks: { ...task.checks, [columnId]: !task.checks[columnId] } }
        : task),
    }))
  }

  function renameTask(taskId: string, title: string) {
    const nextTitle = title.trim()
    if (!nextTitle) return
    setChecklist((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, title: nextTitle } : task),
    }))
  }

  function moveTask(taskId: string, targetTaskId: string, after: boolean) {
    setChecklist((current) => ({ ...current, tasks: moveItemNextTo(current.tasks, taskId, targetTaskId, after) }))
  }

  function deleteTask(taskId: string) {
    setChecklist((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== taskId) }))
  }

  function clearCompleted() {
    setChecklist((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => !isTaskComplete(task, current.columns)),
    }))
  }

  function clearTasks() {
    setChecklist((current) => ({ ...current, tasks: [] }))
  }

  function clearColumns() {
    setChecklist((current) => removeColumns(current, current.columns.map((column) => column.id)))
  }

  function addColumn(name: string) {
    setChecklist((current) => addChecklistColumn(current, name, () => crypto.randomUUID()))
  }

  function renameColumn(columnId: string, name: string) {
    const nextName = name.trim()
    if (!nextName) return
    setChecklist((current) => ({
      ...current,
      columns: current.columns.map((column) => column.id === columnId ? { ...column, name: nextName } : column),
    }))
  }

  function deleteColumn(columnId: string) {
    setChecklist((current) => removeColumns(current, [columnId]))
  }

  function moveColumn(columnId: string, targetColumnId: string, after: boolean) {
    setChecklist((current) => ({ ...current, columns: moveItemNextTo(current.columns, columnId, targetColumnId, after) }))
  }

    return { ...checklist, addTasks, loadSample, toggleTask, renameTask, moveTask, deleteTask, clearCompleted, clearTasks, clearColumns, addColumn, renameColumn, deleteColumn, moveColumn }
}

type DragReorderOptions = {
  axis: 'x' | 'y'
  itemSelector: string
  getItemId: (item: HTMLElement) => string | undefined
  scrollRef: RefObject<HTMLElement | null>
  getStartInset: () => number
  onMove: (id: string, targetId: string, after: boolean) => void
}

function useDragReorder(options: DragReorderOptions) {
  const [drag, setDrag] = useState<ReorderDrag | null>(null)
  const dragRef = useRef<ReorderDrag | null>(null)
  const optionsRef = useRef(options)
  const pointerRef = useRef(0)
  const draggingId = drag?.id ?? null

  useEffect(() => {
    dragRef.current = drag
    optionsRef.current = options
  })

  useEffect(() => {
    if (!draggingId) return
    let frame = 0
    const pointerOf = (event: PointerEvent) => optionsRef.current.axis === 'y' ? event.clientY : event.clientX

    const orderAtPointer = (current: ReorderDrag) => {
      const { axis, itemSelector, getItemId, scrollRef } = optionsRef.current
      const items = Array.from(scrollRef.current?.querySelectorAll<HTMLElement>(itemSelector) ?? [])
      const middles = items
        .filter((item) => getItemId(item) !== current.id)
        .map((item) => {
          const rect = item.getBoundingClientRect()
          return axis === 'y' ? rect.top + rect.height / 2 : rect.left + rect.width / 2
        })
      const renderedOrder = items.flatMap((item) => getItemId(item) ?? [])
      return previewOrder(renderedOrder, current.id, getInsertIndex(middles, pointerRef.current))
    }

    // Each frame: scroll near the table edges, then move the dragged item to where the pointer is.
    const update = () => {
      const { axis, scrollRef, getStartInset } = optionsRef.current
      const scroller = scrollRef.current
      const pointer = pointerRef.current
      if (scroller) {
        const bounds = scroller.getBoundingClientRect()
        const start = Math.max(0, (axis === 'y' ? bounds.top : bounds.left) + getStartInset())
        const end = Math.min(axis === 'y' ? window.innerHeight : window.innerWidth, axis === 'y' ? bounds.bottom : bounds.right)
        const edge = 48
        const maxStep = 24
        const step = pointer < start + edge
          ? -Math.min(maxStep, Math.ceil((start + edge - pointer) / 4))
          : pointer > end - edge ? Math.min(maxStep, Math.ceil((pointer - end + edge) / 4)) : 0
        if (step && axis === 'y') scroller.scrollTop += step
        else if (step) scroller.scrollLeft += step
      }
      const current = dragRef.current
      if (current) {
        const order = orderAtPointer(current)
        if (order.some((id, index) => id !== current.order[index]) || order.length !== current.order.length) {
          setDrag((latest) => latest && latest.id === current.id ? { ...latest, order } : latest)
        }
      }
      frame = window.requestAnimationFrame(update)
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = pointerOf(event)
    }
    const handlePointerUp = (event: PointerEvent) => {
      pointerRef.current = pointerOf(event)
      const current = dragRef.current
      setDrag(null)
      if (!current) return
      const order = orderAtPointer(current)
      if (order.every((id, index) => id === current.initialOrder[index])) return
      const target = getMoveTarget(order, current.id)
      if (target) optionsRef.current.onMove(current.id, target.targetId, target.after)
    }
    const handleCancel = () => setDrag(null)
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') handleCancel()
    }

    frame = window.requestAnimationFrame(update)
    document.body.classList.add('task-dragging')
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handleCancel)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('blur', handleCancel)
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.classList.remove('task-dragging')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handleCancel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('blur', handleCancel)
    }
  }, [draggingId])

  function startDrag(event: ReactPointerEvent<HTMLElement>, id: string, order: string[]) {
    if (event.button !== 0) return
    event.preventDefault()
    pointerRef.current = optionsRef.current.axis === 'y' ? event.clientY : event.clientX
    setDrag({ id, order, initialOrder: order })
  }

  return { drag, startDrag }
}

type TaskChecklistProps = ReturnType<typeof useTaskChecklist>

export function TaskChecklistPanel({ columns, tasks, addTasks, loadSample, toggleTask, renameTask, moveTask, deleteTask, clearCompleted, clearTasks, clearColumns, addColumn, renameColumn, deleteColumn, moveColumn }: TaskChecklistProps) {
  const [taskDraft, setTaskDraft] = useState('')
  const [columnDraft, setColumnDraft] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskNameDraft, setTaskNameDraft] = useState('')
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const tableBodyRef = useRef<HTMLTableSectionElement>(null)
  const [sortMode, setSortMode] = useState<'manual' | 'asc' | 'desc'>('manual')
  const headingId = useId()
  const taskDraftId = useId()
  const columnDraftId = useId()
  const sortId = useId()
  const finishedTasks = tasks.filter((task) => isTaskComplete(task, columns)).length
  const completedSteps = columns.length
    ? tasks.reduce((count, task) => count + columns.filter((column) => task.checks[column.id]).length, 0)
    : finishedTasks
  const totalSteps = tasks.length * Math.max(1, columns.length)
  const progressPercent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0
  const sortedTasks = sortMode === 'manual' ? tasks : [...tasks].sort((a, b) => sortMode === 'asc'
    ? a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    : b.title.localeCompare(a.title, undefined, { sensitivity: 'base' }))
  const taskDrag = useDragReorder({
    axis: 'y',
    itemSelector: 'tbody tr[data-task-id]',
    getItemId: (row) => row.dataset.taskId,
    scrollRef: tableScrollRef,
    getStartInset: () => tableScrollRef.current?.querySelector('thead')?.getBoundingClientRect().height ?? 0,
    onMove: moveTask,
  })
  const columnDrag = useDragReorder({
    axis: 'x',
    itemSelector: 'thead th[data-column-id]',
    getItemId: (cell) => cell.dataset.columnId,
    scrollRef: tableScrollRef,
    getStartInset: () => tableScrollRef.current?.querySelector('thead th')?.getBoundingClientRect().width ?? 0,
    onMove: moveColumn,
  })
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const columnsById = new Map(columns.map((column) => [column.id, column]))
  const displayedTasks = taskDrag.drag
    ? reconcileOrder(taskDrag.drag.order, sortedTasks.map((task) => task.id)).flatMap((id) => tasksById.get(id) ?? [])
    : sortedTasks
  const displayedColumns = columnDrag.drag
    ? reconcileOrder(columnDrag.drag.order, columns.map((column) => column.id)).flatMap((id) => columnsById.get(id) ?? [])
    : columns
  const draggingTaskId = taskDrag.drag?.id ?? null
  const draggingColumnId = columnDrag.drag?.id ?? null

  function handleAddTasks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const titles = taskDraft.split(/\r?\n/).map((title) => title.trim()).filter(Boolean)
    if (!titles.length) return
    addTasks(titles)
    setTaskDraft('')
  }

  function handleTaskDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  function handleAddColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = columnDraft.trim()
    if (!name) return
    addColumn(name)
    setColumnDraft('')
  }

  function handleLoadSample() {
    if ((columns.length > 0 || tasks.length > 0) && !window.confirm('Replace the current checklist with sample data?')) return
    loadSample()
  }

  function handleClearTasks() {
    if (tasks.length > 0 && window.confirm('Clear all tasks? Your columns will stay.')) clearTasks()
  }

  function handleClearColumns() {
    if (columns.length > 0 && window.confirm('Clear all columns? Your tasks stay, and tasks finished in every column stay marked done.')) clearColumns()
  }

  function handleSaveTaskName(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault()
    const title = taskNameDraft.trim()
    if (!title) return
    renameTask(taskId, title)
    setEditingTaskId(null)
    setTaskNameDraft('')
  }

  function handleEditTaskKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    setEditingTaskId(null)
    setTaskNameDraft('')
  }

  function handleTaskReorderKeyDown(event: KeyboardEvent<HTMLButtonElement>, taskId: string, index: number) {
    if (sortMode !== 'manual' || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
    const target = displayedTasks[index + (event.key === 'ArrowUp' ? -1 : 1)]
    if (!target) return
    event.preventDefault()
    moveTask(taskId, target.id, event.key === 'ArrowDown')
    window.requestAnimationFrame(() => {
      tableBodyRef.current?.querySelector<HTMLButtonElement>(`tr[data-task-id="${CSS.escape(taskId)}"] .task-drag-handle`)?.focus()
    })
  }

  function handleColumnReorderKeyDown(event: KeyboardEvent<HTMLButtonElement>, columnId: string, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const target = displayedColumns[index + (event.key === 'ArrowLeft' ? -1 : 1)]
    if (!target) return
    event.preventDefault()
    moveColumn(columnId, target.id, event.key === 'ArrowRight')
    window.requestAnimationFrame(() => {
      tableScrollRef.current?.querySelector<HTMLButtonElement>(`th[data-column-id="${CSS.escape(columnId)}"] .task-drag-handle`)?.focus()
    })
  }

  return (
    <div className="workbench task-workbench" data-tool-id="task-checklist">
      <div className="tool-toolbar" aria-label="Tool actions">
        <div className="toolbar-section" role="group" aria-label="Checklist actions">
          <h1 className="tool-title">Task Checklist</h1>
          <span className="toolbar-label">Data</span>
          <div className="toolbar-group">
            <button className="button button-primary" type="button" onClick={handleLoadSample} title="Load sample checklist">
              <SparklesIcon />
              <span>Sample</span>
            </button>
            <button className="button button-quiet button-danger" type="button" onClick={handleClearTasks} disabled={tasks.length === 0} title="Clear all tasks and keep columns">
              <TrashIcon />
              <span>Clear Tasks</span>
            </button>
            <button className="button button-quiet button-danger" type="button" onClick={handleClearColumns} disabled={columns.length === 0} title="Clear all columns and keep tasks">
              <TrashIcon />
              <span>Clear Columns</span>
            </button>
          </div>
        </div>

        <div className="toolbar-section toolbar-section-output" role="group" aria-label="View options">
          <label className="toolbar-label" htmlFor={sortId}>Sort</label>
          <select id={sortId} className="task-sort-select" value={sortMode} disabled={tasks.length < 2} onChange={(event) => setSortMode(event.target.value as 'manual' | 'asc' | 'desc')}>
            <option value="manual">Manual (drag to reorder)</option>
            <option value="asc">Name A–Z</option>
            <option value="desc">Name Z–A</option>
          </select>
        </div>
      </div>

      <div className="task-compose-bar">
        <form className="task-add-form" onSubmit={handleAddTasks}>
          <label className="toolbar-label" htmlFor={taskDraftId}>New Task</label>
          <textarea
            id={taskDraftId}
            rows={1}
            value={taskDraft}
            onChange={(event) => setTaskDraft(event.target.value)}
            onKeyDown={handleTaskDraftKeyDown}
            placeholder="Type a task, press Enter"
            title="Enter to add · Shift+Enter for a new line · paste several lines to add many"
          />
          <button type="submit" className="button button-primary" disabled={!taskDraft.trim()}>Add</button>
        </form>

        <form className="task-column-add" onSubmit={handleAddColumn}>
          <label className="toolbar-label" htmlFor={columnDraftId}>Column</label>
          <input id={columnDraftId} value={columnDraft} onChange={(event) => setColumnDraft(event.target.value)} placeholder="e.g. Review, QA" maxLength={48} />
          <button type="submit" className="button" disabled={!columnDraft.trim()}>Add</button>
        </form>
      </div>

      <section className="pane task-board-pane" aria-labelledby={headingId}>
        <div className="pane-header">
          <div className="pane-title">
            <span id={headingId}>PROGRESS</span>
            {totalSteps > 0 && <span className={progressPercent === 100 ? 'task-progress-percent complete' : 'task-progress-percent'}>{progressPercent}%</span>}
          </div>
          <div className="pane-meta">
            <span>{tasks.length
              ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${finishedTasks} done${columns.length ? ` · ${completedSteps}/${totalSteps} steps` : ''}`
              : 'No tasks yet'}</span>
            {finishedTasks > 0 && (
              <button type="button" className="task-clear-completed" onClick={clearCompleted}>
                Clear finished
              </button>
            )}
          </div>
        </div>
        {totalSteps > 0 && <progress className="task-progress" value={completedSteps} max={totalSteps} aria-label={columns.length === 0 ? `${finishedTasks} of ${tasks.length} tasks complete` : `${completedSteps} of ${totalSteps} steps complete`} />}

        {tasks.length === 0 && columns.length === 0 ? (
          <div className="compare-empty">
            <SparklesIcon />
            <strong>Your tasks will appear here</strong>
            <span>Add a task above, or load a sample to get started</span>
          </div>
        ) : (
          <div className="task-table-scroll" ref={tableScrollRef}>
            <table className={columns.length === 0 ? 'task-table task-table-simple' : 'task-table'}>
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  {columns.length === 0 ? <th scope="col">Done</th> : displayedColumns.map((column, index) => (
                    <th scope="col" key={column.id} data-column-id={column.id} className={draggingColumnId === column.id ? 'task-col-dragging' : undefined}>
                      <div className="task-column-heading">
                        {columns.length > 1 && (
                          <button
                            type="button"
                            className="task-drag-handle task-column-drag-handle"
                            aria-label={`Reorder ${column.name} column; drag or use arrow keys`}
                            title="Drag to reorder · arrow keys to move"
                            onPointerDown={(event) => columnDrag.startDrag(event, column.id, displayedColumns.map((item) => item.id))}
                            onKeyDown={(event) => handleColumnReorderKeyDown(event, column.id, index)}
                          >
                            <GripIcon />
                          </button>
                        )}
                        <input
                          aria-label={`Rename ${column.name} column`}
                          defaultValue={column.name}
                          size={Math.max(6, column.name.length + 1)}
                          maxLength={48}
                          onBlur={(event) => {
                            const name = event.currentTarget.value.trim()
                            if (name) renameColumn(column.id, name)
                            else event.currentTarget.value = column.name
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') event.currentTarget.blur()
                          }}
                        />
                        <button
                          type="button"
                          className="task-column-delete"
                          aria-label={`Delete ${column.name} column`}
                          title={`Delete ${column.name} column`}
                          onClick={() => {
                            if (window.confirm(`Delete "${column.name}" and its checks for all tasks?`)) deleteColumn(column.id)
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody ref={tableBodyRef}>
                {tasks.length === 0 ? (
                  <tr><td className="task-table-empty" colSpan={Math.max(2, columns.length + 1)}>Add a task above to start tracking.</td></tr>
                ) : displayedTasks.map((task, index) => (
                  <tr
                    key={task.id}
                    data-task-id={task.id}
                    className={draggingTaskId === task.id ? 'task-row-dragging' : ''}
                  >
                    <th scope="row">
                      {editingTaskId === task.id ? (
                        <form className="task-name-editor" aria-label={`Edit ${task.title}`} onSubmit={(event) => handleSaveTaskName(event, task.id)} onKeyDown={handleEditTaskKeyDown}>
                          <input autoFocus value={taskNameDraft} onChange={(event) => setTaskNameDraft(event.target.value)} aria-label="Task name" />
                          <button type="submit" className="button button-primary" disabled={!taskNameDraft.trim()}>Save</button>
                          <button type="button" className="button" onClick={() => { setEditingTaskId(null); setTaskNameDraft('') }}>Cancel</button>
                        </form>
                      ) : (
                        <div className={`task-name-cell ${isTaskComplete(task, columns) ? 'complete' : ''}`}>
                          {sortMode === 'manual' && displayedTasks.length > 1 && (
                            <button
                              type="button"
                              className="task-drag-handle"
                              aria-label={`Reorder ${task.title}; drag or use arrow keys`}
                              title="Drag to reorder · arrow keys to move"
                              onPointerDown={(event) => taskDrag.startDrag(event, task.id, displayedTasks.map((item) => item.id))}
                              onKeyDown={(event) => handleTaskReorderKeyDown(event, task.id, index)}
                            >
                              <GripIcon />
                            </button>
                          )}
                          <span>{task.title}</span>
                          <div className="task-row-actions">
                            <button
                              type="button"
                              className="task-row-action task-edit"
                              aria-label={`Edit ${task.title}`}
                              title={`Edit ${task.title}`}
                              onClick={() => { setEditingTaskId(task.id); setTaskNameDraft(task.title) }}
                            >
                              ✎
                            </button>
                            <button type="button" className="task-delete" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>×</button>
                          </div>
                        </div>
                      )}
                    </th>
                    {columns.length === 0 && (
                      <td className="task-check-cell">
                        <input
                          type="checkbox"
                          checked={task.checks[defaultCheckId] ?? false}
                          aria-label={`Done for ${task.title}`}
                          onChange={() => toggleTask(task.id, defaultCheckId)}
                        />
                      </td>
                    )}
                    {displayedColumns.map((column) => (
                      <td className={draggingColumnId === column.id ? 'task-check-cell task-col-dragging' : 'task-check-cell'} key={column.id}>
                        <input
                          type="checkbox"
                          checked={task.checks[column.id] ?? false}
                          aria-label={`${column.name} for ${task.title}`}
                          onChange={() => toggleTask(task.id, column.id)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export function TaskChecklistWorkspace() {
  const taskChecklist = useTaskChecklist()
  return <TaskChecklistPanel {...taskChecklist} />
}
