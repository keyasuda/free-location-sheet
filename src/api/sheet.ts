import { v4 as uuidv4 } from 'uuid'
import { split } from 'shellwords'
import { Belonging } from '../state/types'
import _ from 'lodash'
import { format } from 'date-fns'

const header = {
  storages: ['row', 'id', 'name', 'description', 'printed'],
  belongings: [
    'row',
    'id',
    'name',
    'description',
    'quantities',
    'storageId',
    'printed',
    'deadline',
  ],
}

export const Sheet = {
  documentId: null,

  create: async (title: string) => {
    // create a new sheet
    const newSheet = await Sheet.service.spreadsheets.create({
      resource: {
        properties: {
          title,
        },
      },
      fields: 'spreadsheetId',
    })

    const id = newSheet.result.spreadsheetId
    Sheet.documentId = id

    // format
    await Sheet.format()
    await Sheet.setInitialItems()

    return id
  },

  init: async (documentId: string, auth, sheetsService) => {
    Sheet.auth = auth
    Sheet.service = sheetsService

    if (Sheet.documentId === documentId) {
      return
    }

    Sheet.documentId = documentId

    if (documentId) await Sheet.format()
  },

  missingSheets: async () => {
    const currentSheets = await Sheet.sheets()
    return _.difference(['belongings', 'storages'], currentSheets)
  },

  missingHeaders: async () => {
    const range = {
      storages: 'storages!A1:E1',
      belongings: 'belongings!A1:H1',
    }
    const ret = await Sheet.service.spreadsheets.values.batchGet({
      spreadsheetId: Sheet.documentId,
      ranges: [range.storages, range.belongings],
    })

    const storageRange = ret.result.valueRanges.find(
      (v) => v.range == range.storages
    )
    const belongingRange = ret.result.valueRanges.find(
      (v) => v.range == range.belongings
    )

    const actual = {
      storages: storageRange.values ? storageRange.values[0] : [],
      belongings: belongingRange.values ? belongingRange.values[0] : [],
    }

    return {
      belongings: _.difference(header.belongings, actual.belongings),
      storages: _.difference(header.storages, actual.storages),
    }
  },

  format: async () => {
    // add required sheets
    const missing = await Sheet.missingSheets()
    for (let n of missing) {
      await Sheet.createSheet(n)
    }

    // check headers
    const missingHeaders = await Sheet.missingHeaders()
    const req = []
    if (missingHeaders.belongings.length > 0) {
      req.push({
        range: 'belongings!A1:H1',
        values: header.belongings,
      })
    }
    if (missingHeaders.storages.length > 0) {
      req.push({
        range: 'storages!A1:E1',
        values: header.storages,
      })
    }

    if (req.length > 0) {
      await Sheet.update(req)
    }
  },

  setInitialItems: async () => {
    await Sheet.update([
      {
        range: 'belongings!A2:H2',
        values: ['=ROW()', uuidv4(), '最初の物品', '', 1, '', false, ''],
      },
      {
        range: 'storages!A2:E2',
        values: ['=ROW()', uuidv4(), '最初の保管場所', '', false],
      },
    ])
  },

  endpoint: () => {
    return (
      'https://docs.google.com/spreadsheets' + `/d/${Sheet.documentId}/gviz/tq`
    )
  },

  sheets: async () => {
    const response = await Sheet.service.spreadsheets.get({
      spreadsheetId: Sheet.documentId,
    })
    return (response.data || response.result).sheets.map(
      (s) => s.properties.title
    )
  },

  createSheet: (title: string) => {
    const params = {
      spreadsheetId: Sheet.documentId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    }

    return Sheet.service.spreadsheets.batchUpdate(params)
  },

  query: async (query: string, sheet: string) => {
    const url =
      Sheet.endpoint() + `?tq=${encodeURIComponent(query)}` + `&sheet=${sheet}`

    const response = await Sheet.auth.request({ url })
    const text = response.data || (await response.text())
    // response will in JSONP formats - needs this before parsing
    const match = text.match(
      /google\.visualization\.Query\.setResponse\((.+)\)/
    )

    // ret will in [[row1 col1, row1 col2...], [row2 col1, row2 col2...]]
    return JSON.parse(match[1]).table.rows.map((e) =>
      e.c.map((e2) => {
        if (e2 == null) {
          return null
        } else {
          return e2.v
        }
      })
    )
  },

  add: (range: string, rows: array[]) => {
    const params = {
      spreadsheetId: Sheet.documentId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: rows },
    }
    return Sheet.service.spreadsheets.values.append(params)
  },

  update: (request: array) => {
    const data = request.map((r) => ({ range: r.range, values: [r.values] }))
    const params = {
      spreadsheetId: Sheet.documentId,
      resource: {
        data: data,
        valueInputOption: 'USER_ENTERED',
      },
    }
    return Sheet.service.spreadsheets.values.batchUpdate(params)
  },

  storages: {
    queryResultToStorage: (r) => ({
      klass: 'storage',
      id: r[1],
      name: r[2],
      description: r[3],
      printed: r[4],
    }),

    add: async (newItems: Storage[]) => {
      const items = newItems.map((i) => ({ ...i, ...{ id: uuidv4() } }))
      const payload = items.map((i) => [
        '=ROW()',
        i.id,
        i.name,
        i.description,
        'FALSE',
      ])
      await Sheet.add('storages!A:A', payload)

      return items
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'storages')
      if (ret.length == 0) {
        return null
      }

      return Sheet.storages.queryResultToStorage(ret[0])
    },

    update: async (updates: Storage[]) => {
      // retrieve ROW, ID
      const rows = await Sheet.query(
        'select A, B where ' + updates.map((u) => `(B="${u.id}")`).join(' or '),
        'storages'
      )

      const requests = updates
        .map((u) => {
          const row = rows.find((r) => r[1] == u.id)
          if (row != undefined) {
            return {
              range: `storages!C${row[0]}:E${row[0]}`,
              values: [u.name, u.description, u.printed],
            }
          }
        })
        .filter((e) => e)

      if (requests.length > 0) {
        await Sheet.update(requests)
      }

      return updates
    },

    delete: async (id: string) => {
      const row = (
        await Sheet.query(`select A where B="${id}"`, 'storages')
      )[0][0]

      if (row != undefined) {
        await Sheet.update([
          { range: `storages!A${row}:E${row}`, values: ['', '', '', '', ''] },
        ])
      }
    },

    search: async (params) => {
      const { keyword, page } = params

      let words
      try {
        words = split(keyword)
      } catch {
        words = [keyword]
      }

      let q
      if (keyword.length == 0) {
        q = 'select *'
      } else {
        q =
          'select * where (' +
          words.map((w) => `(C contains "${w}")`).join(' and ') +
          ') or (' +
          words.map((w) => `(D contains "${w}")`).join(' and ') +
          ')'
      }
      q = `${q} order by A desc limit 51 offset ${50 * page}`

      const results = await Sheet.query(q, 'storages')

      let items = results.map((r) => Sheet.storages.queryResultToStorage(r))
      let nextPage = false
      if (items.length > 50) {
        items.pop()
        nextPage = true
      }

      return { items, nextPage, page }
    },

    findByPrinted: async (printed: boolean) => {
      const results = await Sheet.query(
        `select * where E=${printed}`,
        'storages'
      )
      return results.map((r) => Sheet.storages.queryResultToStorage(r))
    },
  },

  belongings: {
    queryResultToBelonging: (r) => ({
      klass: 'belonging',
      id: r[1],
      name: r[2],
      description: r[3],
      quantities: r[4],
      storageId: r[5],
      printed: r[6],
      deadline: r[7] ? format(eval('new ' + r[7]), 'yyyy/MM/dd') : null,
    }),

    add: async (newItems: Belonging[]) => {
      const items = newItems.map((i) => ({ ...{ id: uuidv4() }, ...i }))
      const payload = items.map((i) => [
        '=ROW()',
        i.id,
        i.name,
        i.description,
        i.quantities,
        i.storageId,
        String(i.printed),
        i.deadline,
      ])
      await Sheet.add('belongings!A:A', payload)

      return items
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'belongings')
      if (ret.length == 0) {
        return null
      }

      return Sheet.belongings.queryResultToBelonging(ret[0])
    },

    update: async (updates: Belonging[]) => {
      // retrieve ROW, ID
      const rows = await Sheet.query(
        'select A, B where ' + updates.map((u) => `(B="${u.id}")`).join(' or '),
        'belongings'
      )

      const requests = updates
        .map((u) => {
          const row = rows.find((r) => r[1] == u.id)
          if (row != undefined) {
            return {
              range: `belongings!C${row[0]}:H${row[0]}`,
              values: [
                u.name,
                u.description,
                u.quantities,
                u.storageId,
                u.printed,
                u.deadline,
              ],
            }
          }
        })
        .filter((e) => e)

      if (requests.length > 0) {
        await Sheet.update(requests)
      }

      return updates
    },

    delete: async (id: string) => {
      const row = (
        await Sheet.query(`select A where B="${id}"`, 'belongings')
      )[0][0]

      if (row != undefined) {
        await Sheet.update([
          {
            range: `belongings!A${row}:H${row}`,
            values: ['', '', '', '', '', '', '', ''],
          },
        ])
      }
    },

    search: async (params) => {
      const { keyword, page, deadline } = params

      let words
      try {
        words = split(keyword)
      } catch {
        words = [keyword]
      }

      let q, o
      if (words.length > 0) {
        q =
          '(' +
          words.map((w) => `(C contains "${w}")`).join(' and ') +
          ') or (' +
          words.map((w) => `(D contains "${w}")`).join(' and ') +
          ')'
      }
      o = 'order by A desc'

      if (deadline) {
        if (q) {
          q = `(${q}) and (H is not null)`
        } else {
          q = '(H is not null)'
        }
        o = 'order by H'
      }

      if (q) {
        q = `select * where ${q} ${o} limit 51 offset ${50 * page}`
      } else {
        q = `select * ${o} limit 51 offset ${50 * page}`
      }

      const results = await Sheet.query(q, 'belongings')
      let items = results.map((r) => Sheet.belongings.queryResultToBelonging(r))
      let nextPage = false
      if (items.length > 50) {
        items.pop()
        nextPage = true
      }

      return { items, nextPage, page }
    },

    findByPrinted: async (printed: boolean) => {
      const results = await Sheet.query(
        `select * where G=${printed}`,
        'belongings'
      )
      return results.map((r) => Sheet.belongings.queryResultToBelonging(r))
    },
  },
}
