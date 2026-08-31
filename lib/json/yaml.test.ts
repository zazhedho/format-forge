import { describe, expect, it } from 'vitest'
import { jsonToYaml } from './yaml'

describe('jsonToYaml', () => {
  it('serializes nested JSON as readable block YAML', () => {
    expect(jsonToYaml({ name: 'Maeve', tags: ['json', 'tools'] })).toBe(
      'name: Maeve\ntags:\n  - json\n  - tools\n'
    )
  })

  it('quotes strings that look like YAML booleans', () => {
    expect(jsonToYaml({ value: 'true' })).toContain('value: "true"')
  })
})
