import { describe, expect, it } from 'vitest'
import { tableToCsv, tableToTsv } from './table-export'
import { toTableModel } from './table'

describe('table export', () => {
  it('creates tab-separated key/value text', () => {
    expect(tableToTsv(toTableModel({ name: 'Maeve', active: true }))).toBe('key\tvalue\nname\tMaeve\nactive\ttrue')
  })

  it('creates CSV for record rows and quotes special values', () => {
    const model = toTableModel([{ id: 1, name: 'Maeve, Winters' }, { id: 2 }])
    expect(tableToCsv(model)).toBe('id,name\n1,"Maeve, Winters"\n2,')
  })
})
