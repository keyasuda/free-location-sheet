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

      })

      it('should get null with invalid ID', async () => {

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
    describe('add', () => {
      it('should add new belongings', async () => {

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
