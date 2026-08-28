import Link from 'next/link'
import type { ToolId } from '@/lib/tools/registry'
import { getTool } from '@/lib/tools/registry'
import { ToolWorkbench } from './tool-workbench'
import { ChevronRightIcon } from './icons'

export function ToolRoute({ toolId }: { toolId: ToolId }) {
  const tool = getTool(toolId)

  return (
    <main className="page-container tool-page">
      <div className="tool-header-bar">
        <nav className="breadcrumbs" aria-label="Breadcrumbs">
          <Link href="/">Format Forge</Link>
          <span className="breadcrumb-sep" aria-hidden="true">
            <ChevronRightIcon />
          </span>
          <span>{tool.category} Tools</span>
          <span className="breadcrumb-sep" aria-hidden="true">
            <ChevronRightIcon />
          </span>
          <span>{tool.title}</span>
        </nav>
        <div className="tool-heading">
          <div>
            <h1>{tool.title}</h1>
            <p className="lede">{tool.description}</p>
          </div>
          <span className="privacy-badge">
            <span className="privacy-dot" />
            Runs locally in browser
          </span>
        </div>
      </div>
      <ToolWorkbench toolId={toolId} />
    </main>
  )
}
