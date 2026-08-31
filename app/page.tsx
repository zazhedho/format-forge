import Link from 'next/link'
import { tools } from '@/lib/tools/registry'
import {
  TableIcon,
  FormatterIcon,
  FixerIcon,
  ValidatorIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '@/components/icons'

function getToolIcon(id: string) {
  switch (id) {
    case 'json-to-table':
      return <TableIcon />
    case 'json-formatter':
      return <FormatterIcon />
    case 'json-fixer':
      return <FixerIcon />
    case 'json-validator':
      return <ValidatorIcon />
    default:
      return <SparklesIcon />
  }
}

const toolChips: Record<string, string[]> = {
  'json-to-table': ['Spreadsheet View', 'Deep Search', 'CSV Export'],
  'json-to-csv': ['CSV Output', 'Quoted Values', 'Instant Export'],
  'json-to-yaml': ['Readable Output', 'Nested Arrays', 'Instant Copy'],
  'json-to-xml': ['XML Output', 'Custom Options', 'Instant Copy'],
  'xml-to-json': ['JSON Output', 'Attributes', 'Instant Copy'],
  'json-formatter': ['2-Space Indent', 'Minify Mode', 'Instant Copy'],
  'json-fixer': ['Trailing Commas', 'Quote Fixes', 'Safe Repair'],
  'json-validator': ['Line/Col Locator', 'Syntax Check', 'Structure Stats'],
  'compare-text': ['Line Diff', 'Side by Side', 'Any Text'],
}

export default function HomePage() {
  return (
    <main className="catalog page-container">
      <section className="hero-section">
        <div className="eyebrow">
          <SparklesIcon />
          <span>Developer Utility Platform</span>
        </div>
        <h1>
          <span className="gradient-text">Shape data.</span>
          <br />
          <em>Forge clarity.</em>
        </h1>
        <p className="lede">
          Fast, local-first utilities for inspecting, formatting, fixing, and validating JSON without sending any data to a remote server.
        </p>

        <div className="hero-features">
          <span className="hero-pill">🔒 100% Client-Side Privacy</span>
          <span className="hero-pill">⚡ 0ms Server Latency</span>
          <span className="hero-pill">📂 Local File Upload</span>
          <span className="hero-pill">⌨️ Keyboard Friendly</span>
        </div>
      </section>

      <div className="tool-grid">
        {tools.map((tool) => (
          <Link className="tool-card" href={tool.href} key={tool.id}>
            <div className="tool-card-top">
              <div className="tool-icon-badge">{getToolIcon(tool.id)}</div>
              <span className="tool-card-category">{tool.category}</span>
            </div>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <div className="tool-card-features">
              {(toolChips[tool.id] || []).map((chip) => (
                <span key={chip} className="tool-card-chip">
                  {chip}
                </span>
              ))}
            </div>
            <div className="tool-card-footer">
              <span>Launch Tool</span>
              <span className="tool-card-arrow" aria-hidden="true">
                <ChevronRightIcon />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="why-section">
        <div className="why-grid">
          <div className="why-item">
            <h3>🔒 Complete Privacy</h3>
            <p>Your payloads and data never leave your browser memory. No telemetry, no logs, and no server databases.</p>
          </div>
          <div className="why-item">
            <h3>⚡ Instant Execution</h3>
            <p>Calculations happen synchronously in your browser engine with instant live feedback as you type.</p>
          </div>
          <div className="why-item">
            <h3>🛠️ Resilient Workflow</h3>
            <p>Source inputs are always preserved even when parsing fails. Switch between tools effortlessly.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
