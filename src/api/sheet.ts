import { v4 as uuidv4 } from 'uuid'
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
    add: (newItems: Storage[]) => {
      const payload = newItems.map((i) => ['=ROW()', uuidv4(), i.name, i.description, 'FALSE'])
      return Sheet.add('storages!A:A', payload)
    },

    get: async (id: string) => {
      const ret = await Sheet.query(`select * where B='${id}'`, 'storages')
      if(ret.length == 0) { return null }

      const item = ret[0]
      return ({
        klass: 'storage',
        id: item[1],
        name: item[2],
        description: item[3],
        printed: item[4]
      })
    },

    update: async (content: Storage) => {
      const row = await Sheet.query(`select A where B="${content.id}"`, 'storages')[0][0]

      if (row != undefined) {
        await Sheet.update(`storages!C${row}:E${row}`, [[content.name, content.description, content.printed]])
      }
    },

    delete: () => {

    },

    search: async (keyword: string) => {
      return byName + byDescription;
    }
  },

  belongings: {
    add: (newItems: Belonging[]) => {
      const payload = newItems.map((i) => ['=ROW()', uuidv4(), i.name, i.quantities, i.storage_id, i.description, 'FALSE'])
      return Sheet.add('belongings!A:A', payload)
    },

    get: () => {

    },

    update: () => {

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
