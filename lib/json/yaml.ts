import { stringify } from 'yaml'
import type { JsonValue } from './types'

export function jsonToYaml(value: JsonValue) {
  return stringify(value)
}
