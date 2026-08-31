import XMLBuilder from 'fast-xml-builder'
import type { JsonPrimitive, JsonValue } from './types'

type XmlValue = JsonPrimitive | XmlValue[] | { [key: string]: XmlValue }

export type JsonToXmlOptions = {
  rootElement?: string
  arrayItem?: string
  declaration?: boolean
  format?: boolean
}

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

function normalizeXmlName(name: string | undefined, fallback: string) {
  return sanitizeXmlName(name?.trim() || fallback)
}

function normalizeValue(value: JsonValue, arrayItemName: string): XmlValue {
  if (Array.isArray(value)) {
    return { [arrayItemName]: value.map((item) => normalizeValue(item, arrayItemName)) }
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

      return [key, normalizeValue(child, arrayItemName)]
    })
  )
}

export function jsonToXml(value: JsonValue, options: JsonToXmlOptions = {}) {
  const rootElement = normalizeXmlName(options.rootElement, 'root')
  const arrayItem = normalizeXmlName(options.arrayItem, 'item')
  const format = options.format ?? true
  const xmlBuilder = new XMLBuilder({
    attributeNamePrefix: '@',
    textNodeName: '#text',
    format,
    indentBy: '  ',
    ignoreAttributes: false,
    suppressEmptyNode: true,
    sanitizeName: sanitizeXmlName,
  })
  const xml = xmlBuilder.build({ [rootElement]: normalizeValue(value, arrayItem) }).trimEnd()

  return options.declaration === false
    ? xml
    : `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`
}
