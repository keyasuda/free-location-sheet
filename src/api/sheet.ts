import { Belonging } from '../state/types'

export const Sheet = {
  documentId: null,

  create: () => {
    // create a new sheet
  },

  init: (documentId: string, auth) => {
    Sheet.documentId = documentId;
    Sheet.auth = auth;

    // check sheets
    // create sheet(s)
    // put header
  },

  endpoint: () => {
    return 'https://docs.google.com/spreadsheets' +
      `/d/${Sheet.documentId}/gviz/tq`
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

  storages: {
    add: (news: Storage[]) => {

    },

    get: () => {

    },

    update: () => {

    },

    delete: () => {

    },

    search: async (keyword: string) => {
      return byName + byDescription;
    }
  },

  belongings: {
    add: (news: Belonging[]) => {

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
