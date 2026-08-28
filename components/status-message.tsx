import type { JsonError } from '@/lib/json/types'
import { ShieldCheckIcon, AlertCircleIcon } from './icons'

export function StatusMessage({ error }: { error?: JsonError }) {
  if (!error) {
    return (
      <span className="status-pill status-pill-valid" role="status">
        <ShieldCheckIcon style={{ width: 13, height: 13 }} />
        <span>Valid JSON</span>
      </span>
    )
  }

  const location =
    error.line && error.column
      ? `(Line ${error.line}, Col ${error.column})`
      : ''

  return (
    <span className="status-pill status-pill-invalid" role="alert" title={`${error.message} ${location}`}>
      <AlertCircleIcon style={{ width: 13, height: 13 }} />
      <span>{error.message} {location}</span>
    </span>
  )
}
