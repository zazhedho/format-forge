import type { JsonValue } from './types'

export type JsonToGoStructOptions = {
  structName?: string
}

type JsonObject = { [key: string]: JsonValue }
type StructField = { name: string; type: string; key: string }
type StructSpec = { name: string; fields: StructField[] }

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function exportedName(rawName: string, fallback: string) {
  const words = rawName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
  const name = words.map((word) => word[0].toUpperCase() + word.slice(1)).join('')
  if (!name) return fallback
  return /^[A-Z]/.test(name) ? name : fallback + name
}

// ponytail: singularizes common trailing-s names; add a pluralization library only if names need linguistic accuracy.
function singularize(name: string) {
  if (name.endsWith('ies') && name.length > 3) return name.slice(0, -3) + 'y'
  if (name.endsWith('s') && !name.endsWith('ss') && name.length > 1) return name.slice(0, -1)
  return name
}

function uniqueName(preferred: string, usedNames: Set<string>) {
  let name = preferred
  let suffix = 2
  while (usedNames.has(name)) name = preferred + suffix++
  usedNames.add(name)
  return name
}

function goTag(key: string) {
  const encoded = JSON.stringify(key).slice(1, -1).replace(new RegExp(String.fromCharCode(96), 'g'), '\\u0060')
  return String.fromCharCode(96) + 'json:"' + encoded + '"' + String.fromCharCode(96)
}

export function jsonToGoStruct(value: JsonValue, options: JsonToGoStructOptions = {}) {
  const rootName = exportedName(options.structName?.trim() || 'Root', 'Root')
  const specs: StructSpec[] = []
  const usedTypeNames = new Set<string>()

  function arrayType(values: JsonValue[], hint: string) {
    if (values.length === 0) return '[]any'
    return '[]' + mergeType(values, hint)
  }

  function scalarType(values: JsonValue[]) {
    const types = new Set(values.map((item) => typeof item))
    if (types.size === 1 && types.has('string')) return 'string'
    if (types.size === 1 && types.has('boolean')) return 'bool'
    if (types.size === 1 && types.has('number')) {
      return values.every((item) => typeof item === 'number' && Number.isInteger(item)) ? 'int' : 'float64'
    }
    return 'any'
  }

  function mergeType(values: JsonValue[], hint: string): string {
    const present = values.filter((item): item is Exclude<JsonValue, null> => item !== null)
    if (present.length === 0) return 'any'

    let type: string
    if (present.every(isObject)) {
      type = registerStruct(present, hint)
    } else if (present.every(Array.isArray)) {
      const elements = present.flatMap((item) => Array.isArray(item) ? item : [])
      type = arrayType(elements, hint)
    } else if (present.every((item) => typeof item !== 'object')) {
      type = scalarType(present)
    } else {
      type = 'any'
    }

    return values.some((item) => item === null) && type !== 'any' ? '*' + type : type
  }

  function registerStruct(objects: JsonObject[], preferredName: string) {
    const spec: StructSpec = {
      name: uniqueName(exportedName(preferredName, 'Value'), usedTypeNames),
      fields: [],
    }
    specs.push(spec)

    const keys = [...new Set(objects.flatMap((object) => Object.keys(object)))]
    const usedFieldNames = new Set<string>()
    for (const key of keys) {
      const name = uniqueName(exportedName(key, 'Field'), usedFieldNames)
      const values = objects.map((object) => Object.prototype.hasOwnProperty.call(object, key) ? object[key] : null)
      const hint = values.some((item) => Array.isArray(item)) ? singularize(name) : name
      spec.fields.push({ name, type: mergeType(values, hint), key })
    }

    return spec.name
  }

  if (isObject(value)) {
    registerStruct([value], rootName)
  } else if (Array.isArray(value)) {
    usedTypeNames.add(rootName)
    const rootType = arrayType(value, rootName + 'Item')
    return ['type ' + rootName + ' ' + rootType, ...specs.map(renderStruct)].join('\n\n')
  } else {
    throw new Error('JSON root must be an object or array')
  }

  return specs.map(renderStruct).join('\n\n')

  function renderStruct(spec: StructSpec) {
    const maxNameLength = Math.max(...spec.fields.map((field) => field.name.length), 0)
    const maxTypeLength = Math.max(...spec.fields.map((field) => field.type.length), 0)
    return [
      'type ' + spec.name + ' struct {',
      ...spec.fields.map((field) => '\t' + field.name.padEnd(maxNameLength + 1) + field.type.padEnd(maxTypeLength + 1) + goTag(field.key)),
      '}',
    ].join('\n')
  }
}
