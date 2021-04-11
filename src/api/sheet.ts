import { v4 as uuidv4 } from 'uuid'
import { split, escape } from 'shellwords'
import { Belonging } from '../state/types'
import _ from 'lodash'

const header = {
  storages: ['row', 'id', 'name', 'description', 'printed'],
  belongings: ['row', 'id', 'name', 'description', 'quantities', 'storageId', 'printed']
}

export const Sheet = {
  documentId: null,

  create: async (title: string) => {
    // create a new sheet
    const newSheet = await Sheet.service.spreadsheets.create({
      resource: {
        properties: {
          title
        }
      },
      fields: 'spreadsheetId'
    })
    Sheet.documentId = newSheet.spreadsheetId

    // format
    await Sheet.format()

    return newSheet.spreadsheetId
  },

  init: (documentId: string, auth, sheetsService) => {
    Sheet.documentId = documentId;
    Sheet.auth = auth;
    Sheet.service = sheetsService;

    // check sheets
    // create sheet(s)
    // put header
  },

  validate: async () => {
    // check sheets
    const currentSheets = await Sheet.sheets()
    const missing = _.difference(['belongings', 'storages'], currentSheets)
    if (missing.length > 0) { return false }

    // check headers
    const range = {
      storages: 'storages!A1:E1',
      belongings: 'belongings!A1:G1'
    }
    const ret = await Sheet.service.spreadsheets.values.batchGet({
      spreadsheetId: Sheet.documentId,
      ranges: [range.storages, range.belongings]
    })
    const actual = {
      storages: ret.data.valueRanges.find((v) => v.range == range.storages).values[0],
      belongings: ret.data.valueRanges.find((v) => v.range == range.belongings).values[0]
    }
    if (_.difference(actual.storages, header.storages).length > 0) { return false }
    if (_.difference(actual.belongings, header.belongings).length > 0) { return false }

    return true
  },

  format: async () => {
    // add required sheets
    const currentSheets = await Sheet.sheets()
    const missing = _.difference(['belongings', 'storages'], currentSheets)
    for(let n of missing) { await Sheet.createSheet(n) }

    // add required headers
    await Sheet.update([
      {
        range: 'belongings!A1:G1',
        values: header.belongings
      },
      {
        range: 'storages!A1:E1',
        values: header.storages
      }
    ])
  },

  endpoint: () => {
    return 'https://docs.google.com/spreadsheets' +
      `/d/${Sheet.documentId}/gviz/tq`
  },

  sheets: async () => {
    const meta = await Sheet.service.spreadsheets.get({spreadsheetId: Sheet.documentId})
    return meta.data.sheets.map((s) => s.properties.title)
  },

  createSheet: (title: string) => {
    const params = {
      spreadsheetId: Sheet.documentId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title
            }
          }
        }]
      }
    }

    return Sheet.service.spreadsheets.batchUpdate(params)
  },

  query: async (query: string, sheet: string) => {
    const url =
      Sheet.endpoint() +
      `?tq=${encodeURIComponent(query)}` +
      `&sheet=${sheet}`

    const response = await Sheet.auth.request({ url })
    const text = response.data
    // response will in JSONP formats - needs this before parsing
    const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\)/)
    console.log(match[1])

    // ret will in [[row1 col1, row1 col2...], [row2 col1, row2 col2...]]
    return JSON.parse(match[1]).table.rows.map((e) => e.c.map((e2) => {
      if (e2 == null) {
        return null
      } else {
        return e2.v
      }
    }))
  },

  add: (range: string, rows: array[]) => {
    const params = {
      spreadsheetId: Sheet.documentId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {values: rows}
    }
    return Sheet.service.spreadsheets.values.append(params)
  },

  update: (request: array) => {
    const data = request.map((r) => ({range: r.range, values: [r.values]}))
    const params = {
      spreadsheetId: Sheet.documentId,
      resource: {
        data: data,
        valueInputOption: 'USER_ENTERED',
      }
    }
    return Sheet.service.spreadsheets.values.batchUpdate(params)
  },

  storages: {
    queryResultToStorage: (r) => ({
      klass: 'storage',
      id: r[1],
      name: r[2],
      description: r[3],
      printed: r[4]
    }),

    add: (newItems: Storage[]) => {
      const payload = newItems.map((i) => ['=ROW()', uuidv4(), i.name, i.description, 'FALSE'])
      return Sheet.add('storages!A:A', payload)
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'storages')
      if(ret.length == 0) { return null }

      return Sheet.storages.queryResultToStorage(ret[0])
    },

    update: async (updates: Storage[]) => {
      // retrieve ROW, ID
      const rows = await Sheet.query('select A, B where ' + updates.map((u) => `(B="${u.id}")`).join(' or '), 'storages')

      const requests = updates.map((u) => {
        const row = rows.find((r) => r[1] == u.id)
        if (row != undefined) {
          return ({
            range: `storages!C${row[0]}:E${row[0]}`,
            values: [u.name, u.description, u.printed]
          })
        }
      }).filter((e) => e)

      if (requests.length > 0) { await Sheet.update(requests) }
    },

    delete: async (id: string) => {
      const row = (await Sheet.query(`select A where B="${id}"`, 'storages'))[0][0]

      if (row != undefined) {
        await Sheet.update(`storages!A${row}:E${row}`, [['', '', '' ,'', '']])
      }
    },

    search: async (keyword: string) => {
      let words
      try {
        words = split(keyword)
      } catch {
        words = [keyword]
      }

      const q =
        'select * where (' +
        words.map((w) => `(C contains "${escape(w)}")`).join(' and ') + ') or (' +
        words.map((w) => `(D contains "${escape(w)}")`).join(' and ') + ')'

      const results = await Sheet.query(q, 'storages')

      return results.map((r) => Sheet.storages.queryResultToStorage(r))
    },

    findByPrinted: async (printed: boolean) => {
      const results = await Sheet.query(`select * where E=${printed}`, 'storages')
      return results.map((r) => Sheet.storages.queryResultToStorage(r))
    }
  },

  belongings: {
    queryResultToBelonging: (r) => ({
      klass: 'belonging',
      id: r[1],
      name: r[2],
      description: r[3],
      quantities: r[4],
      storageId: r[5],
      printed: r[6]
    }),

    add: (newItems: Belonging[]) => {
      const payload = newItems.map((i) => ['=ROW()', uuidv4(), i.name, i.description, i.quantities, i.storageId, 'FALSE'])
      return Sheet.add('belongings!A:A', payload)
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'belongings')
      if(ret.length == 0) { return null }

      return Sheet.belongings.queryResultToBelonging(ret[0])
    },

    update: async (updates: Belonging[]) => {
      // retrieve ROW, ID
      const rows = await Sheet.query('select A, B where ' + updates.map((u) => `(B="${u.id}")`).join(' or '), 'belongings')

      const requests = updates.map((u) => {
        const row = rows.find((r) => r[1] == u.id)
        if (row != undefined) {
          return ({
            range: `belongings!C${row[0]}:G${row[0]}`,
            values: [u.name, u.description, u.quantities, u.storageId, u.printed]
          })
        }
      }).filter((e) => e)

      if (requests.length > 0) { await Sheet.update(requests) }
    },

    delete: async (id: string) => {
      const row = (await Sheet.query(`select A where B="${id}"`, 'belongings'))[0][0]

      if (row != undefined) {
        await Sheet.update(`belongings!A${row}:G${row}`, [['', '', '' ,'', '', '', '']])
      }
    },

    search: async (keyword: string) => {
      let words
      try {
        words = split(keyword)
      } catch {
        words = [keyword]
      }

      const q =
        'select * where (' +
        words.map((w) => `(C contains "${escape(w)}")`).join(' and ') + ') or (' +
        words.map((w) => `(D contains "${escape(w)}")`).join(' and ') + ')'

      const results = await Sheet.query(q, 'belongings')

      return results.map((r) => Sheet.belongings.queryResultToBelonging(r))
    },

    findByPrinted: async (printed: boolean) => {
      const results = await Sheet.query(`select * where E=${printed}`, 'belongings')
      return results.map((r) => Sheet.belongings.queryResultToBelonging(r))
    }
  }
}
