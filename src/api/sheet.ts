import { v4 as uuidv4 } from 'uuid'
import { split, escape } from 'shellwords'
import { Belonging } from '../state/types'

export const Sheet = {
  documentId: null,

  create: () => {
    // create a new sheet
  },

  init: (documentId: string, auth, sheetsService) => {
    Sheet.documentId = documentId;
    Sheet.auth = auth;
    Sheet.service = sheetsService;

    // check sheets
    // create sheet(s)
    // put header
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

  update: (range: string, rows: array[]) => {
    const params = {
      spreadsheetId: Sheet.documentId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {values: rows}
    }
    return Sheet.service.spreadsheets.values.update(params)
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

    update: async (content: Storage) => {
      const row = await Sheet.query(`select A where B="${content.id}"`, 'storages')[0][0]

      if (row != undefined) {
        await Sheet.update(`storages!C${row}:E${row}`, [[content.name, content.description, content.printed]])
      }
    },

    delete: async (id: string) => {
      const row = await Sheet.query(`select A where B="${id}"`, 'storages')[0][0]

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

    findByPrinted: async (printed) => {
      const results = await Sheet.query(`select * where E=${printed}`, 'storages')
      return results.map((r) => Sheet.storages.queryResultToStorage(r))
    }
  },

  belongings: {
    queryResultToStorage: (r) => ({
      klass: 'belonging',
      id: r[1],
      name: r[2],
      description: r[3],
      quantities: r[4],
      storage: r[5],
      printed: r[6]
    }),

    add: (newItems: Belonging[]) => {
      const payload = newItems.map((i) => ['=ROW()', uuidv4(), i.name, i.description, i.quantities, i.storage_id, 'FALSE'])
      return Sheet.add('belongings!A:A', payload)
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'belongings')
      if(ret.length == 0) { return null }

      return Sheet.belongings.queryResultToStorage(ret[0])
    },

    update: async (content: Belonging) => {
      const row = await Sheet.query(`select A where B="${content.id}"`, 'belongings')[0][0]

      if (row != undefined) {
        await Sheet.update(`belongings!C${row}:G${row}`, [[
          content.name,
          content.description,
          content.quantities,
          content.storage,
          content.printed
        ]])
      }
    },

    delete: () => {

    },

    search: async (keyword: string) => {
      const b = Sheet.belongings;
      // select by name
      const byName = await b.query(Columns.belongings.name, keyword);
      // select by description
      const byDescription = await b.query(Columns.belongings.description, keyword);

      return byName + byDescription;
    }
  }
}
