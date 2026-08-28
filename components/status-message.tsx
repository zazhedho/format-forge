import type { JsonError } from '@/lib/json/types'

export function StatusMessage({ error }: { error?: JsonError }) {
  if (!error) return <p className="status status-valid" role="status">● Valid JSON</p>
  const location = error.line && error.column ? `Line ${error.line}, column ${error.column}.` : ''
  return <p className="status status-invalid" role="alert">× {error.message} {location}</p>
}
