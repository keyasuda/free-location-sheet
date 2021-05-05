import { storagesSlice, storagesAsyncThunk } from './storagesSlice'
import { Storage } from './types'
import { Sheet } from '../api/sheet'

let b1, b2, b3
beforeEach(() => {
  b1 = {
    id: 'storage-id-1',
    name: 'storage 1',
    description: '',
  }

  b2 = {
    id: 'storage-id-2',
    name: 'storage 2',
    description: '',
  }

  b3 = {
    id: 'storage-id-3',
    name: 'storage 3',
    description: '',
  }
})

const reducer = storagesSlice.reducer
const actions = storagesSlice.actions

describe('storages slice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      list: [],
      pending: false,
      page: 0,
      nextPage: false,
    })
  })

  describe('search', () => {
    const search = storagesAsyncThunk.search

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = search.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = search.fulfilled({
          items: [b1],
          nextPage: true,
          page: 0,
        })
        const actual = reducer(
          { list: [], pending: true, page: 5, nextPage: false },
          action
        )

        expect(actual).toEqual({
          list: [b1],
          pending: false,
          page: 0,
          nextPage: true,
        })
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = search.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('searchNext', () => {
    const thunk = storagesAsyncThunk.searchNext

    describe('pending', () => {
      it('shouldnt set state pending=true', () => {
        const action = thunk.pending()
        expect(reducer({ pending: false }, action).pending).toBe(false)
      })
    })

    describe('fulfilled', () => {
      it('should append payload to the list', () => {
        const action = thunk.fulfilled({
          items: [b1],
          nextPage: false,
          page: 1,
        })
        const actual = reducer(
          { list: [b2], pending: false, nextPage: true, page: 0 },
          action
        )

        expect(actual.list).toEqual([b2, b1])
        expect(actual.pending).toBe(false)
      })
    })
  })

  describe('findByPrinted', () => {
    const thunk = storagesAsyncThunk.findByPrinted

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = thunk.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = thunk.fulfilled([b1])
        const actual = reducer({ list: [], pending: true }, action)

        expect(actual.list).toEqual([b1])
        expect(actual.pending).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = thunk.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('add', () => {
    const add = storagesAsyncThunk.add

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = add.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should append the payload in front of the list', () => {
        const action = add.fulfilled([b2])
        const actual = reducer({ list: [b1], pending: true }, action)

        expect(actual.list).toEqual([b2, b1])
        expect(actual.pending).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = add.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('get', () => {
    const get = storagesAsyncThunk.get
    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = get.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = get.fulfilled(b1)
        const actual = reducer({ list: [], pending: true }, action)

        expect(actual.list).toEqual([b1])
        expect(actual.pending).toBe(false)
      })

      it('should set notFound flag when therere no items', () => {
        const action = get.fulfilled(null)
        const actual = reducer({ list: [], pending: true }, action)

        expect(actual.list).toEqual([])
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = get.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('update', () => {
    const update = storagesAsyncThunk.update

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = update.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should update list item with payload if it exists', () => {
        const newStorages = {
          ...b1,
          name: 'new name',
        }
        const action = update.fulfilled([newStorages])
        const actual = reducer({ list: [b1], pending: true }, action)

        expect(actual.list[0].name).toEqual('new name')
        expect(actual.pending).toBe(false)
      })

      it('shouldnt update list item if it doesnt exist', () => {
        const newStorages = {
          id: 'new id',
          name: 'new name',
        }
        const action = update.fulfilled([newStorages])
        const actual = reducer({ list: [b1], pending: true }, action)

        expect(actual.list).toEqual([b1])
        expect(actual.list[0].name).not.toEqual('new name')
        expect(actual.pending).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = update.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('remove', () => {
    const thunk = storagesAsyncThunk.remove

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = thunk.pending()
        expect(reducer({ pending: false }, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should remove the payload from the list', () => {
        const action = thunk.fulfilled(b1)
        const actual = reducer({ list: [b1, b2], pending: true }, action)

        expect(actual.list).toEqual([b2])
        expect(actual.pending).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = thunk.rejected()
        expect(reducer({ pending: true }, action).pending).toBe(false)
      })
    })
  })

  describe('@@router/LOCATION_CHANGE', () => {
    it('should clear the list', () => {
      const actual = reducer(
        { list: [b1] },
        { type: '@@router/LOCATION_CHANGE' }
      )
      expect(actual.list).toEqual([])
    })
  })
})

describe('async thunks', () => {
  let args, result, action, subject

  describe('add', () => {
    const thunk = storagesAsyncThunk.add

    beforeEach(() => {
      args = [
        { name: b1.name, description: b1.description },
        { name: b2.name, description: b2.description },
      ]
      action = thunk(args)
      Sheet.storages.add = jest.fn()
      Sheet.storages.add.mockResolvedValue([b1, b2])
    })

    it('calls Sheet.storages.add', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.add).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual([b1, b2])
    })
  })

  describe('get', () => {
    const thunk = storagesAsyncThunk.get

    beforeEach(() => {
      args = 'id'
      action = thunk(args)
      Sheet.storages.get = jest.fn()
      Sheet.storages.get.mockResolvedValue(b1)
    })

    it('calls Sheet.storages.get', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.get).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual(b1)
    })
  })

  describe('search', () => {
    const thunk = storagesAsyncThunk.search

    beforeEach(() => {
      args = 'keyword'
      result = {
        items: [b1, b3],
        nextPage: false,
      }
      action = thunk(args, 0)
      Sheet.storages.search = jest.fn()
      Sheet.storages.search.mockResolvedValue(result)
    })

    it('calls Sheet.storages.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.search).toHaveBeenCalledWith(args, 0)
      expect(subject.payload).toEqual(result)
    })
  })

  describe('searchNext', () => {
    const thunk = storagesAsyncThunk.searchNext

    beforeEach(() => {
      args = { keyword: 'keyword', page: 2 }
      result = { items: [b1, b3], nextPage: true }
      action = thunk(args)
      Sheet.storages.search = jest.fn()
      Sheet.storages.search.mockResolvedValue(result)
    })

    it('calls Sheet.storages.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.search).toHaveBeenCalledWith(
        args.keyword,
        args.page
      )
      expect(subject.payload).toEqual(result)
    })
  })

  describe('findByPrinted', () => {
    const thunk = storagesAsyncThunk.findByPrinted

    beforeEach(() => {
      result = [b1, b3]
      action = thunk(true)
      Sheet.storages.findByPrinted = jest.fn()
      Sheet.storages.findByPrinted.mockResolvedValue(result)
    })

    it('calls Sheet.storages.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.findByPrinted).toHaveBeenCalledWith(true)
      expect(subject.payload).toEqual(result)
    })
  })

  describe('update', () => {
    const thunk = storagesAsyncThunk.update

    beforeEach(() => {
      args = b1
      result = b1
      action = thunk(args)
      Sheet.storages.update = jest.fn()
      Sheet.storages.update.mockResolvedValue(result)
    })

    it('calls Sheet.storages.update', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.update).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual(result)
    })
  })
})
