export function TextOutput({ value, warnings = [] }: { value: string; warnings?: string[] }) {
  return <div className="text-output"><pre>{value}</pre>{warnings.length > 0 && <ul className="warnings">{warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}</ul>}</div>
}
