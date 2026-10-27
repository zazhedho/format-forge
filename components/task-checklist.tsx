'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'

export type Task = { id: string; title: string; done: boolean }

const storageKey = 'format-forge:tasks'

function isTaskList(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every((task) => {
    if (typeof task !== 'object' || task === null) return false
    const item = task as Record<string, unknown>
    return typeof item.id === 'string' && typeof item.title === 'string' && item.title.trim() !== '' && typeof item.done === 'boolean'
  })
}

export function useTaskChecklist() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored)
        if (isTaskList(parsed)) setTasks(parsed.filter((task) => !task.id.startsWith('starter-')))
      }
    } catch {
      // Keep the checklist empty if browser storage is unavailable or invalid.
    }
    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(tasks))
    } catch {
      // Checklist still works for this session if browser storage is unavailable.
    }
  }, [storageReady, tasks])

  function addTasks(titles: string[]) {
    setTasks((current) => [...current, ...titles.map((title) => ({ id: crypto.randomUUID(), title, done: false }))])
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.done))
  }

  return { tasks, addTasks, toggleTask, deleteTask, clearCompleted }
}

type TaskChecklistProps = ReturnType<typeof useTaskChecklist>

export function TaskChecklistPanel({ tasks, addTasks: onAddTasks, toggleTask, deleteTask, clearCompleted }: TaskChecklistProps) {
  const [draft, setDraft] = useState('')
  const headingId = useId()
  const draftId = useId()
  const completedCount = tasks.filter((task) => task.done).length

  function handleAddTasks(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const titles = draft.split(/\r?\n/).map((title) => title.trim()).filter(Boolean)
    if (!titles.length) return

    onAddTasks(titles)
    setDraft('')
  }

  return (
      <section className="task-checklist-section" aria-labelledby={headingId}>
        <div className="task-menu-heading">
          <h2 id={headingId}>Your tasks</h2>
          <span>{tasks.length ? `${completedCount} of ${tasks.length} complete` : '0 tasks'}</span>
        </div>
        {tasks.length > 0 && <progress className="task-progress" value={completedCount} max={tasks.length} aria-label={`${completedCount} of ${tasks.length} tasks complete`} />}
        <ul className="task-list">
          {tasks.map((task) => (
            <li className="task-row" key={task.id}>
              <label className={`task-label ${task.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <button type="button" className="task-delete" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}>
                ×
              </button>
            </li>
          ))}
          {tasks.length === 0 && <li className="task-empty">Add tasks below.</li>}
        </ul>
        <form className="task-add-form" onSubmit={handleAddTasks}>
          <label className="visually-hidden" htmlFor={draftId}>Add tasks, one per line</label>
          <textarea id={draftId} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add tasks, one per line" />
          <button type="submit" className="button button-primary">Add tasks</button>
        </form>
        {completedCount > 0 && (
          <button type="button" className="task-clear-completed" onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </section>
  )
}

export function TaskChecklistWorkspace() {
  const taskChecklist = useTaskChecklist()
  return <TaskChecklistPanel {...taskChecklist} />
}
