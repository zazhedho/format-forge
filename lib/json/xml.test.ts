import { describe, expect, it } from 'vitest'
import { jsonToXml } from './xml'

describe('jsonToXml', () => {
  it('serializes objects with a root element and readable indentation', () => {
    expect(jsonToXml({ name: 'Maeve', active: true })).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <name>Maeve</name>\n  <active>true</active>\n</root>'
    )
  })

  it('serializes arrays as item elements', () => {
    expect(jsonToXml({ tags: ['json', 'tools'] })).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <tags>\n    <item>json</item>\n    <item>tools</item>\n  </tags>\n</root>'
    )
  })

  it('supports attributes and text nodes through explicit JSON keys', () => {
    expect(jsonToXml({ user: { '@id': '42', '#text': 'Maeve' } })).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <user id="42">Maeve</user>\n</root>'
    )
  })

  it('escapes XML text characters', () => {
    expect(jsonToXml({ value: '<hello> & "world"' })).toContain(
      '<value>&lt;hello&gt; &amp; &quot;world&quot;</value>'
    )
  })

  it('sanitizes unsafe element names', () => {
    const output = jsonToXml({ 'first name': 'Maeve', '123status': true })

    expect(output).toContain('<first_name>Maeve</first_name>')
    expect(output).toContain('<_123status>true</_123status>')
  })

  it('rejects non-scalar attribute values', () => {
    expect(() => jsonToXml({ '@id': { nested: true } })).toThrow(
      'XML attributes must use scalar values'
    )
  })

  it('uses custom root and array item names without a declaration or formatting', () => {
    expect(jsonToXml({ tags: ['json', 'tools'] }, {
      rootElement: 'catalog',
      arrayItem: 'tag',
      declaration: false,
      format: false,
    })).toBe('<catalog><tags><tag>json</tag><tag>tools</tag></tags></catalog>')
  })
})
