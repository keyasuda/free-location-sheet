import { Belonging } from '../state/types'

export const Sheet = {
  create: () => {
    // create a new sheet
  },

  init: () => {
    // check sheets
    // create sheet(s)
    // put header
  },

  storages: {

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
    },

    query: (column: string, keyword: string) => {

    }
  }
}
