import { describe, expect, it } from 'vitest'
import { diffWords } from './word-diff'

describe('diffWords', () => {
  it('marks only changed words on each side', () => {
    const result = diffWords('name: role', 'name: team')

    expect(result.left.filter((segment) => segment.type === 'changed').map((segment) => segment.text)).toEqual(['role'])
    expect(result.right.filter((segment) => segment.type === 'changed').map((segment) => segment.text)).toEqual(['team'])
    expect(result.left.filter((segment) => segment.type === 'equal').map((segment) => segment.text).join('')).toBe('name: ')
    expect(result.right.filter((segment) => segment.type === 'equal').map((segment) => segment.text).join('')).toBe('name: ')
  })

  it('marks an inserted word without marking surrounding text', () => {
    const result = diffWords('hello world', 'hello brave world')

    expect(result.left.filter((segment) => segment.type === 'changed')).toEqual([])
    expect(result.right.filter((segment) => segment.type === 'changed').map((segment) => segment.text).join('')).toContain('brave')
    expect(result.right.filter((segment) => segment.type === 'equal').map((segment) => segment.text).join('')).toBe('hello world')
  })
})
