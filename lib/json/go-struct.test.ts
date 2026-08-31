import { describe, expect, it } from 'vitest'
import { jsonToGoStruct } from './go-struct'

describe('jsonToGoStruct', () => {
  it('generates a root Go struct with JSON tags', () => {
    expect(jsonToGoStruct({ name: 'Maeve', age: 30, active: true })).toBe([
      'type Root struct {',
      '\tName   string `json:"name"`',
      '\tAge    int    `json:"age"`',
      '\tActive bool   `json:"active"`',
      '}',
    ].join('\n'))
  })

  it('generates nested structs and slices for object arrays', () => {
    expect(jsonToGoStruct({
      company: 'Format Forge',
      employees: [
        { name: 'Maeve', active: true },
        { name: 'Jon', active: false },
      ],
    })).toBe([
      'type Root struct {',
      '\tCompany   string     `json:"company"`',
      '\tEmployees []Employee `json:"employees"`',
      '}',
      '',
      'type Employee struct {',
      '\tName   string `json:"name"`',
      '\tActive bool   `json:"active"`',
      '}',
    ].join('\n'))
  })

  it('uses pointers for nullable fields in object arrays', () => {
    const output = jsonToGoStruct({
      users: [
        { name: 'Maeve', age: 30 },
        { name: null, age: null },
      ],
    })

    expect(output).toContain('Users []User')
    expect(output).toContain('Name *string')
    expect(output).toContain('Age  *int')
  })

  it('sanitizes custom struct names and preserves original JSON keys', () => {
    const output = jsonToGoStruct({ 'first-name': 'Maeve' }, { structName: 'api response' })

    expect(output).toContain('type ApiResponse struct')
    expect(output).toContain('FirstName string')
    expect(output).toContain('`json:"first-name"`')
  })

  it('uses any for empty and mixed-type arrays', () => {
    const output = jsonToGoStruct({ tags: [], values: [1, 'one'] })

    expect(output).toContain('Tags   []any')
    expect(output).toContain('Values []any')
  })

  it('supports a root array with a named item struct', () => {
    const output = jsonToGoStruct([{ name: 'Maeve' }], { structName: 'People' })

    expect(output).toContain('type People []PeopleItem')
    expect(output).toContain('type PeopleItem struct')
  })
})
