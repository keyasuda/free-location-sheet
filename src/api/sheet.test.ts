import uuid from 'uuid'
import { Sheet } from './sheet'

describe('Sheet', () => {
  beforeEach(() => {
    Sheet.sheets = jest.fn()
    Sheet.createSheet = jest.fn()
    Sheet.query = jest.fn()
    Sheet.add = jest.fn()
    Sheet.update = jest.fn()
  })

  describe('storages', () => {
    const api = Sheet.storages

    describe('add', () => {
      it('should add new storages', async () => {
        const generateduuid = 'generateduuid'
        jest.spyOn(uuid, 'v4').mockReturnValue(generateduuid)

        const newItems = [
          {name: 'item 1', description: 'desc 1'},
          {name: 'item 2', description: 'desc 2'}
        ]
        await api.add(newItems)

        expect(Sheet.add).toHaveBeenCalledWith(
          'storages!A:A',
          [
            ['=ROW()', generateduuid, 'item 1', 'desc 1', 'FALSE'],
            ['=ROW()', generateduuid, 'item 2', 'desc 2', 'FALSE']
          ]
        )
      })
    })

    describe('get', () => {
      it('should get single storage', async () => {
        const expected = {
          klass: 'storage',
          id: 'storageuuid',
          name: 'storage 1',
          description: 'description 1',
          printed: true
        }
        Sheet.query.mockReturnValue([[
          2, expected.id, expected.name, expected.description, expected.printed
        ]])
        const actual = await api.get('storageuuid')

        expect(Sheet.query).toHaveBeenCalledWith(
          "select * where B='storageuuid'",
          'storages'
        )
        expect(actual).toEqual(expected)
      })

      it('should get null with invalid ID', async () => {
        Sheet.query.mockReturnValue([])
        const actual = await api.get('nonexistent')
        expect(actual).toBe(null)
      })
    })

    describe('update', () => {
      it('should update a storage', async () => {

      })

      it('throw an error when ID is invalid', async () => {

      })
    })

    describe('search', () => {
      it('should find storages by name', async () => {

      })

      it('should find storages by description', async () => {

      })
    })
  })

  describe('belongings', () => {
    const api = Sheet.belongings

    describe('add', () => {
      it('should add new belongings', async () => {
        const generateduuid = 'b-generateduuid'
        jest.spyOn(uuid, 'v4').mockReturnValue(generateduuid)

        const newItems = [
          {name: 'item 1', quantities: 1, description: 'desc 1', storage_id: 'storage-id'},
          {name: 'item 2', quantities: 2, description: 'desc 2', storage_id: ''}
        ]
        await api.add(newItems)

        expect(Sheet.add).toHaveBeenCalledWith(
          'belongings!A:A',
          [
            ['=ROW()', generateduuid, 'item 1', 1, 'storage-id', 'desc 1', 'FALSE'],
            ['=ROW()', generateduuid, 'item 2', 2, '', 'desc 2', 'FALSE']
          ]
        )
      })
    })

    describe('get', () => {
      it('should get single belonging', async () => {

      })

      it('should get null with invalid ID', async () => {

      })
    })

    describe('update', () => {
      it('should update a belonging', async () => {

      })

      it('throw an error when ID is invalid', async () => {

      })
    })

    describe('search', () => {
      it('should find belongings by name', async () => {

      })

      it('should find belongings by description', async () => {

      })
    })
  })
})
