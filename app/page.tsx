import Link from 'next/link'
import { tools } from '@/lib/tools/registry'

export default function HomePage() {
  return (
    <main className="catalog page-container">
      <p className="eyebrow">Developer utility platform</p>
      <h1>Shape data.<br /><em>Ship clarity.</em></h1>
      <p className="lede">Fast, local-first tools for working with JSON and the formats around it.</p>
      <div className="tool-grid">
        {tools.map((tool) => (
          <Link className="tool-card" href={tool.href} key={tool.id}>
            <span className="tool-card-category">{tool.category}</span>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <span className="tool-card-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
