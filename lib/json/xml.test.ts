import { describe, expect, it } from 'vitest'
import { jsonToXml, xmlToJson } from './xml'

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

describe('xmlToJson', () => {
  it('converts XML elements into JSON while preserving the root', () => {
    expect(xmlToJson('<root><name>Maeve</name></root>')).toEqual({
      root: { name: 'Maeve' },
    })
  })

  it('maps attributes, text nodes, and repeated elements to JSON conventions', () => {
    expect(xmlToJson('<root><user id="42">Maeve</user><user id="43">Jon</user></root>')).toEqual({
      root: {
        user: [
          { '#text': 'Maeve', '@id': '42' },
          { '#text': 'Jon', '@id': '43' },
        ],
      },
    })
  })

  it('infers safe element scalar values and ignores the XML declaration', () => {
    expect(xmlToJson('<?xml version="1.0"?><root><count>2</count><active>true</active></root>')).toEqual({
      root: { count: 2, active: true },
    })
  })

  it('rejects malformed XML with a readable error', () => {
    expect(() => xmlToJson('<root><name></root>')).toThrow(/Invalid XML:/)
  })

  it('rejects XML documents with multiple root elements', () => {
    expect(() => xmlToJson('<root /><other />')).toThrow('one root element')
  })
})
