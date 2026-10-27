import { TaskChecklistWorkspace } from '@/components/task-checklist'
import { createPageMetadata } from '@/lib/site'

export const metadata = createPageMetadata(
  'Task Checklist',
  'Create tasks and track workflow steps in customizable columns in your browser.',
  '/task-checklist',
)

export default function TaskChecklistPage() {
  return (
    <main className="page-container tool-page task-checklist-page">
      <TaskChecklistWorkspace />
    </main>
  )
}
