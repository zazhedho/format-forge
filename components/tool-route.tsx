import type { ToolId } from '@/lib/tools/registry'
import { getTool } from '@/lib/tools/registry'
import { ToolWorkbench } from './tool-workbench'

export function ToolRoute({ toolId }: { toolId: ToolId }) {
  const tool = getTool(toolId)
  return (
    <main className="page-container tool-page">
      <p className="eyebrow">{tool.category} utility</p>
      <div className="tool-heading"><div><h1>{tool.title}</h1><p className="lede">{tool.description}</p></div><span className="privacy-note">● Runs locally in your browser</span></div>
      <ToolWorkbench toolId={toolId} />
    </main>
  )
}
