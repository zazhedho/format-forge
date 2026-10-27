import { TaskChecklistWorkspace } from '@/components/task-checklist'
import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata(
  'Task Checklist',
  'Create and track a personal task checklist in your browser.',
  '/task-checklist',
)

export default function TaskChecklistPage() {
  return (
    <main className="page-container task-checklist-page">
      <header className="task-checklist-page-header">
        <h1>Task Checklist</h1>
        <p className="lede">Add tasks, track progress, and clear completed work.</p>
      </header>
      <TaskChecklistWorkspace />
    </main>
  )
}
