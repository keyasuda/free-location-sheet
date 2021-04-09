import uuid from 'uuid'
import { Sheet } from './sheet'

const spreadsheetId = 'spreadsheetid'

describe('Sheet', () => {
  beforeEach(() => {
    Sheet.documentId = spreadsheetId
    Sheet.service = {
      spreadsheets: {
        values: {
          batchGet: jest.fn()
        }
      }
    }
    Sheet.sheets = jest.fn()
    Sheet.createSheet = jest.fn()
    Sheet.query = jest.fn()
    Sheet.add = jest.fn()
    Sheet.update = jest.fn()
  })

  describe('common methods', () => {
    describe('validate', () => {
      it('should return true when its valid', async () => {
        Sheet.sheets.mockReturnValue(['belongings', 'storages'])
        Sheet.service.spreadsheets.values.batchGet.mockResolvedValue({
          data: {
            valueRanges: [
              {
                range: 'storages!A1:E1',
                majorDimension: 'ROWS',
                values: [ [ 'row', 'id', 'name', 'description', 'printed' ] ]
              },
              {
                range: 'belongings!A1:G1',
                majorDimension: 'ROWS',
                values: [
                  [
                    'row',
                    'id',
                    'name',
                    'description',
                    'quantities',
                    'storageId',
                    'printed'
                  ]
                ]
              }
            ]
          }
        })

        const actual = await Sheet.validate()

        expect(actual).toBe(true)
        expect(Sheet.service.spreadsheets.values.batchGet).toHaveBeenCalledWith({
          spreadsheetId,
          ranges: ['storages!A1:E1', 'belongings!A1:G1']
        })
      })

      it('should return false when therere missed sheets', async () => {
        Sheet.sheets.mockReturnValue(['belongings'])

        const actual = await Sheet.validate()

        expect(actual).toBe(false)
      })

      it('should return false when any headers are missing', async () => {
        Sheet.sheets.mockResolvedValue(['belongings', 'storages'])
        Sheet.service.spreadsheets.values.batchGet.mockResolvedValue({
          data: {
            valueRanges: [
              {
                range: 'storages!A1:E1',
                majorDimension: 'ROWS',
                values: [ [ 'row', 'id', 'name', 'description', 'printed' ] ]
              },
              {
                range: 'belongings!A1:G1',
                majorDimension: 'ROWS',
                values: [
                  [
                    'ROW', // wrong case
                    'ID', // wrong case
                    'name',
                    '', // description is missing
                    'quantities',
                    'storageId',
                    'printed'
                  ]
                ]
              }
            ]
          }
        })

        const actual = await Sheet.validate()

        expect(actual).toBe(false)
      })
    })

    describe('format', () => {
      it('should add two sheets, belongings and storages', async () => {
        Sheet.sheets.mockReturnValue([])
        await Sheet.format()

        expect(Sheet.sheets).toHaveBeenCalled()
        expect(Sheet.createSheet).toHaveBeenCalledWith('belongings')
        expect(Sheet.createSheet).toHaveBeenCalledWith('storages')
      })

      it('should add missed sheet', async () => {
        Sheet.sheets.mockReturnValue(['belongings'])
        await Sheet.format()

        expect(Sheet.sheets).toHaveBeenCalled()
        expect(Sheet.createSheet).not.toHaveBeenCalledWith('belongings')
        expect(Sheet.createSheet).toHaveBeenCalledWith('storages')
      })

      it('should (over)write headers to sheets', async () => {
        Sheet.sheets.mockReturnValue(['belongings', 'storages'])
        await Sheet.format()

        expect(Sheet.update).toHaveBeenCalledWith([
          {
            range: 'belongings!A1:G1',
            values: ['row', 'id', 'name', 'description', 'quantities', 'storageId', 'printed']
          },
          {
            range: 'storages!A1:E1',
            values: ['row', 'id', 'name', 'description', 'printed']
          }
        ])
      })
    })
  })

  describe('storages', () => {
    const api = Sheet.storages
    const expected = {
      klass: 'storage',
      id: 'storageuuid',
      name: 'storage 1',
      description: 'description 1',
      printed: true
    }

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
        const s1 = expected
        const s2 = {...expected, id: 's2uuid'}
        Sheet.query.mockReturnValue([[3, s2.id], [5, s1.id]])

        await api.update([s1, s2])

        expect(Sheet.query).toHaveBeenCalledWith(`select A, B where (B="${s1.id}") or (B="${s2.id}")`, 'storages')
        expect(Sheet.update).toHaveBeenCalledWith([
          {
            range: 'storages!C5:E5',
            values: [s1.name, s1.description, s1.printed]
          },
          {
            range: 'storages!C3:E3',
            values: [s2.name, s2.description, s2.printed]
          }
        ])
      })

      it('should drop nonexistent record', async () => {
        const s1 = expected
        const s2 = {...expected, id: 's2uuid'}
        Sheet.query.mockReturnValue([[3, s2.id]])

        await api.update([s1, s2])

        expect(Sheet.query).toHaveBeenCalledWith(`select A, B where (B="${s1.id}") or (B="${s2.id}")`, 'storages')
        expect(Sheet.update).toHaveBeenCalledWith([
          {
            range: 'storages!C3:E3',
            values: [s2.name, s2.description, s2.printed]
          }
        ])
      })

      it('should do nothing when all records are nonexistent', async () => {
        const s1 = expected
        const s2 = {...expected, id: 's2uuid'}
        Sheet.query.mockReturnValue([])

        await api.update([s1, s2])

        expect(Sheet.query).toHaveBeenCalledWith(`select A, B where (B="${s1.id}") or (B="${s2.id}")`, 'storages')
        expect(Sheet.update).not.toHaveBeenCalled()
      })
    })

    describe('delete', () => {
      it('should overwrite entire row with blank', async () => {
        Sheet.query.mockReturnValue([[4]])

        await api.delete('storageuuid')

        expect(Sheet.query).toHaveBeenCalledWith('select A where B="storageuuid"', 'storages')
        expect(Sheet.update).toHaveBeenCalledWith('storages!A4:E4', [['', '', '', '', '']])
      })

      it('should do nothing when the id is nonexistent', async () => {
        Sheet.query.mockReturnValue([[]])

        await api.delete('storageuuid')

        expect(Sheet.query).toHaveBeenCalledWith('select A where B="storageuuid"', 'storages')
        expect(Sheet.update).not.toHaveBeenCalled()
      })
    })

    describe('search', () => {
      beforeEach(() => {
        Sheet.query.mockReturnValue([[2, expected.id, expected.name, expected.description, expected.printed]])
      })

      describe('with single word', () => {
        it('should find storages by both name and description', async () => {
          const actual = await api.search('storage')

          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "storage")) or ((D contains "storage"))', 'storages')
          expect(actual).toEqual([expected])
        })
      })

      describe('with two words', () => {
        it('should find storages by both name and description', async () => {
          const actual = await api.search('storage name')

          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "storage") and (C contains "name")) or ((D contains "storage") and (D contains "name"))', 'storages')
          expect(actual).toEqual([expected])
        })
      })

      describe('with word includes quote', () => {
        it('should be escaped', async () => {
          const actual = await api.search('hoge"hoge')
          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "hoge\\"hoge")) or ((D contains "hoge\\"hoge"))', 'storages')
        })
      })
    })

    describe('findByPrinted', () => {
      beforeEach(() => {
        Sheet.query.mockReturnValue([[2, expected.id, expected.name, expected.description, expected.printed]])
      })

      it('should find printed=false', async () => {
        const actual = await api.findByPrinted(false)

        expect(Sheet.query).toHaveBeenCalledWith('select * where E=false', 'storages')
        expect(actual).toEqual([expected])
      })
    })
  })

  describe('belongings', () => {
    const api = Sheet.belongings
    const expected = {
      klass: 'belonging',
      id: 'belonginguuid',
      name: 'belonging 1',
      quantities: 1,
      storageId: 'storageuuid',
      description: 'belonging description',
      printed: false
    }

    describe('add', () => {
      it('should add new belongings', async () => {
        const generateduuid = 'b-generateduuid'
        jest.spyOn(uuid, 'v4').mockReturnValue(generateduuid)

        const newItems = [
          {name: 'item 1', quantities: 1, description: 'desc 1', storageId: 'storage-id'},
          {name: 'item 2', quantities: 2, description: 'desc 2', storageId: ''}
        ]
        await api.add(newItems)

        expect(Sheet.add).toHaveBeenCalledWith(
          'belongings!A:A',
          [
            ['=ROW()', generateduuid, 'item 1', 'desc 1', 1, 'storage-id', 'FALSE'],
            ['=ROW()', generateduuid, 'item 2', 'desc 2', 2, '', 'FALSE']
          ]
        )
      })
    })

    describe('get', () => {
      it('should get single belonging', async () => {
        Sheet.query.mockReturnValue([[
          2, expected.id,
          expected.name,
          expected.description,
          expected.quantities,
          expected.storageId,
          expected.printed
        ]])
        const actual = await api.get('belonginguuid')

        expect(Sheet.query).toHaveBeenCalledWith(
          "select * where B='belonginguuid'",
          'belongings'
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
      const b1 = expected
      const b2 = {...expected, id: 'b2uuid', name: 'b2'}

      it('should update a belonging', async () => {
        Sheet.query.mockReturnValue([[3, b2.id], [5, b1.id]])

        await api.update([b1, b2])

        expect(Sheet.query).toHaveBeenCalledWith(`select A, B where (B="${b1.id}") or (B="${b2.id}")`, 'belongings')
        expect(Sheet.update).toHaveBeenCalledWith([
          {
            range: 'belongings!C5:G5',
            values: [b1.name, b1.description, b1.quantities, b1.storageId, b1.printed]
          },
          {
            range: 'belongings!C3:G3',
            values: [b2.name, b2.description, b2.quantities, b2.storageId, b2.printed]
          }
        ])
      })

      it('should drop nonexistent record', async () => {
        Sheet.query.mockReturnValue([[3, b2.id]])

        await api.update([b1, b2])

        expect(Sheet.update).toHaveBeenCalledWith([
          {
            range: 'belongings!C3:G3',
            values: [b2.name, b2.description, b2.quantities, b2.storageId, b2.printed]
          }
        ])
      })

      it('should do nothing when all records are nonexistent', async () => {
        Sheet.query.mockReturnValue([])

        await api.update([b1, b2])

        expect(Sheet.update).not.toHaveBeenCalled()
      })
    })

    describe('delete', () => {
      it('should overwrite entire row with blank', async () => {
        Sheet.query.mockReturnValue([[4]])

        await api.delete('belonginguuid')

        expect(Sheet.query).toHaveBeenCalledWith('select A where B="belonginguuid"', 'belongings')
        expect(Sheet.update).toHaveBeenCalledWith('belongings!A4:G4', [['', '', '', '', '', '', '']])
      })

      it('should do nothing when the id is nonexistent', async () => {
        Sheet.query.mockReturnValue([[]])

        await api.delete('belonginguuid')

        expect(Sheet.query).toHaveBeenCalledWith('select A where B="belonginguuid"', 'belongings')
        expect(Sheet.update).not.toHaveBeenCalled()
      })
    })

    describe('search', () => {
      beforeEach(() => {
        Sheet.query.mockReturnValue([[
          2,
          expected.id,
          expected.name,
          expected.description,
          expected.quantities,
          expected.storageId,
          expected.printed
        ]])
      })

      describe('with single word', () => {
        it('should find belongings by both name and description', async () => {
          const actual = await api.search('belonging')

          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "belonging")) or ((D contains "belonging"))', 'belongings')
          expect(actual).toEqual([expected])
        })
      })

      describe('with two words', () => {
        it('should find belongings by both name and description', async () => {
          const actual = await api.search('belonging name')

          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "belonging") and (C contains "name")) or ((D contains "belonging") and (D contains "name"))', 'belongings')
          expect(actual).toEqual([expected])
        })
      })

      describe('with word includes quote', () => {
        it('should be escaped', async () => {
          const actual = await api.search('hoge"hoge')
          expect(Sheet.query).toHaveBeenCalledWith('select * where ((C contains "hoge\\"hoge")) or ((D contains "hoge\\"hoge"))', 'belongings')
        })
      })
    })

    describe('findByPrinted', () => {
      beforeEach(() => {
        Sheet.query.mockReturnValue([[
          2,
          expected.id,
          expected.name,
          expected.description,
          expected.quantities,
          expected.storageId,
          expected.printed
        ]])
      })

      it('should find printed=false', async () => {
        const actual = await api.findByPrinted(false)

        expect(Sheet.query).toHaveBeenCalledWith('select * where E=false', 'belongings')
        expect(actual).toEqual([expected])
      })
    })
  })
})
