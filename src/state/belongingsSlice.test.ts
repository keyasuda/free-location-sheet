import { belongingsSlice, belongingsAsyncThunk } from './belongingsSlice'
import { Belonging } from './types'
import { Sheet } from '../api/sheet'

let b1, b2, b3
beforeEach(() => {
  b1 = {
    id: 'belonging-id-1',
    name: 'belonging 1',
    description: '',
  }

  b2 = {
    id: 'belonging-id-2',
    name: 'belonging 2',
    description: '',
  }

  b3 = {
    id: 'belonging-id-3',
    name: 'belonging 3',
    description: '',
  }
})

const reducer = belongingsSlice.reducer
const actions = belongingsSlice.actions

describe('belongings slice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      list: [],
      pending: false,
      updating: false,
      page: 0,
      nextPage: false,
    })
  })

  describe('search', () => {
    const search = belongingsAsyncThunk.search

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = search.pending()
        const actual = reducer({ pending: false, updating: false }, action)
        expect(actual.pending).toBe(true)
        expect(actual.updating).toBe(false)
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
          {
            list: [],
            pending: true,
            updating: false,
            page: 5,
            nextPage: false,
          },
          action
        )

        expect(actual).toEqual({
          list: [b1],
          pending: false,
          updating: false,
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
    const thunk = belongingsAsyncThunk.searchNext

    describe('pending', () => {
      it('shouldnt set state pending=true', () => {
        const action = thunk.pending()
        const actual = reducer({ pending: false, updating: false }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(true)
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
          {
            list: [b2],
            pending: false,
            updating: true,
            nextPage: true,
            page: 0,
          },
          action
        )

        expect(actual.list).toEqual([b2, b1])
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })
  })

  describe('findByPrinted', () => {
    const thunk = belongingsAsyncThunk.findByPrinted

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
    const add = belongingsAsyncThunk.add

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = add.pending()
        const actual = reducer({ pending: false, updating: false }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should append the payload in front of the list', () => {
        const action = add.fulfilled([b2])
        const actual = reducer(
          { list: [b1], pending: false, updating: true },
          action
        )

        expect(actual.list).toEqual([b2, b1])
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = add.rejected()
        const actual = reducer({ pending: false, updating: true }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })
  })

  describe('get', () => {
    const get = belongingsAsyncThunk.get
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
    const update = belongingsAsyncThunk.update

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = update.pending()
        const actual = reducer({ pending: false, updating: false }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should update list item with payload if it exists', () => {
        const newBelongings = {
          ...b1,
          name: 'new name',
        }
        const action = update.fulfilled([newBelongings])
        const actual = reducer(
          { list: [b1], pending: false, updating: true },
          action
        )

        expect(actual.list[0].name).toEqual('new name')
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })

      it('shouldnt update list item if it doesnt exist', () => {
        const newBelongings = {
          id: 'new id',
          name: 'new name',
        }
        const action = update.fulfilled([newBelongings])
        const actual = reducer(
          { list: [b1], pending: false, updating: true },
          action
        )

        expect(actual.list).toEqual([b1])
        expect(actual.list[0].name).not.toEqual('new name')
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = update.rejected()
        const actual = reducer({ pending: false, updating: true }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })
  })

  describe('remove', () => {
    const thunk = belongingsAsyncThunk.remove

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = thunk.pending()
        const actual = reducer({ pending: false, updating: false }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should remove the payload from the list', () => {
        const action = thunk.fulfilled(b1)
        const actual = reducer(
          { list: [b1, b2], pending: false, updating: true },
          action
        )

        expect(actual.list).toEqual([b2])
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = thunk.rejected()
        const actual = reducer({ pending: false, updating: true }, action)
        expect(actual.pending).toBe(false)
        expect(actual.updating).toBe(false)
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
    const thunk = belongingsAsyncThunk.add

    beforeEach(() => {
      args = [
        { name: b1.name, description: b1.description },
        { name: b2.name, description: b2.description },
      ]
      action = thunk(args)
      Sheet.belongings.add = jest.fn()
      Sheet.belongings.add.mockResolvedValue([b1, b2])
    })

    it('calls Sheet.belongings.add', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.add).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual([b1, b2])
    })
  })

  describe('get', () => {
    const thunk = belongingsAsyncThunk.get

    beforeEach(() => {
      args = 'id'
      action = thunk(args)
      Sheet.belongings.get = jest.fn()
      Sheet.belongings.get.mockResolvedValue(b1)
    })

    it('calls Sheet.belongings.get', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.get).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual(b1)
    })
  })

  describe('search', () => {
    const thunk = belongingsAsyncThunk.search

    beforeEach(() => {
      args = 'keyword'
      result = {
        items: [b1, b3],
        nextPage: false,
      }
      action = thunk(args)
      Sheet.belongings.search = jest.fn()
      Sheet.belongings.search.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.search).toHaveBeenCalledWith(args, 0)
      expect(subject.payload).toEqual(result)
    })
  })

  describe('searchNext', () => {
    const thunk = belongingsAsyncThunk.searchNext

    beforeEach(() => {
      args = { keyword: 'keyword', page: 2 }
      result = { items: [b1, b3], nextPage: true }
      action = thunk(args)
      Sheet.belongings.search = jest.fn()
      Sheet.belongings.search.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.search).toHaveBeenCalledWith(
        args.keyword,
        args.page
      )
      expect(subject.payload).toEqual(result)
    })
  })

  describe('findByPrinted', () => {
    const thunk = belongingsAsyncThunk.findByPrinted

    beforeEach(() => {
      result = [b1, b3]
      action = thunk(true)
      Sheet.belongings.findByPrinted = jest.fn()
      Sheet.belongings.findByPrinted.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.findByPrinted).toHaveBeenCalledWith(true)
      expect(subject.payload).toEqual(result)
    })
  })

  describe('update', () => {
    const thunk = belongingsAsyncThunk.update

    beforeEach(() => {
      args = b1
      result = b1
      action = thunk(args)
      Sheet.belongings.update = jest.fn()
      Sheet.belongings.update.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.update', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.update).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual(result)
    })
  })

  describe('remove', () => {
    const thunk = belongingsAsyncThunk.remove

    beforeEach(() => {
      args = b1
      result = b1
      action = thunk(args)
      Sheet.belongings.delete = jest.fn()
      Sheet.belongings.delete.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.delete', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.delete).toHaveBeenCalledWith(args.id)
      expect(subject.payload).toEqual(result)
    })
  })
})
