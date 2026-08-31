import XMLBuilder from 'fast-xml-builder'
import type { JsonPrimitive, JsonValue } from './types'

type XmlValue = JsonPrimitive | XmlValue[] | { [key: string]: XmlValue }

const xmlBuilder = new XMLBuilder({
  attributeNamePrefix: '@',
  textNodeName: '#text',
  format: true,
  indentBy: '  ',
  ignoreAttributes: false,
  suppressEmptyNode: true,
  sanitizeName: sanitizeXmlName,
})

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScalar(value: JsonValue): value is JsonPrimitive {
  return value === null || typeof value !== 'object'
}

function sanitizeXmlName(name: string) {
  const safeName = name.replace(/[^A-Za-z0-9_.-]/g, '_')
  return /^[A-Za-z_]/.test(safeName) ? safeName : `_${safeName}`
}

function normalizeValue(value: JsonValue): XmlValue {
  if (Array.isArray(value)) {
    return { item: value.map(normalizeValue) }
  }

  if (!isObject(value)) return value

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => {
      if (key.startsWith('@')) {
        if (!isScalar(child)) throw new Error('XML attributes must use scalar values')
        return [key, child]
      }

      if (key === '#text' && !isScalar(child)) {
        throw new Error('XML text nodes must use scalar values')
      }

      return [key, normalizeValue(child)]
    })
  )
}

export function jsonToXml(value: JsonValue) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBuilder.build({ root: normalizeValue(value) }).trimEnd()}`
}
