import { printQueueSlice, updateAsPrinted } from './printQueueSlice'
import { Storage, Belonging } from './types'
import { Sheet } from '../api/sheet'

const reducer = printQueueSlice.reducer
const actions = printQueueSlice.actions

let s1: Storage, s2: Storage, s3: Storage
let b1: Belonging, b2: Belonging, b3: Belonging
beforeEach(() => {
  s1 = { klass: 'storage', id: 'storage-1', name: 'storage 1' }
  s2 = { klass: 'storage', id: 'storage-2', name: 'storage 2' }
  s3 = { klass: 'storage', id: 'storage-3', name: 'storage 3' }
  b1 = { klass: 'belonging', id: 'belonging-1', name: 'belonging 1' }
  b2 = { klass: 'belonging', id: 'belonging-2', name: 'belonging 2' }
  b3 = { klass: 'belonging', id: 'belonging-3', name: 'belonging 3' }
})

describe('print queue slice', () => {
  it('should return the initial state', () => {
    const actual = reducer(undefined, {})
    expect(actual).toEqual({
      list: [],
      selected: -1,
      printed: false,
      pending: false,
    })
  })

  describe('add', () => {
    let action, actual

    beforeEach(() => {
      action = actions.add([b2, s1])
      actual = reducer({ list: [b1] }, action)
    })

    it('should add belongings into the list', () => {
      expect(actual.list[0]).toEqual(b1)
      expect(actual.list[1]).toEqual(b2)
    })

    it('should add storages into the list', () => {
      expect(actual.list[2]).toEqual(s1)
    })

    it('shouldnt add existing items', () => {
      actual = reducer({ list: [b2, s1] }, action)
      expect(actual.list.length).toBe(2)
    })
  })

  describe('remove', () => {
    const action = actions.remove

    it('should do nothing when no item is selected', () => {
      const actual = reducer({ list: [b1, b2, b3], selected: -1 }, action)
      expect(actual.selected).toBe(-1)
      expect(actual.list).toEqual([b1, b2, b3])
    })

    describe('when something is selected', () => {
      let actual
      beforeEach(() => {
        actual = reducer({ list: [b1, b2, b3], selected: 1 }, action)
      })

      it('should remove selected item', () => {
        expect(actual.list).toEqual([b1, b3])
      })

      it('should select the below item', () => {
        expect(actual.selected).toBe(1)
      })
    })

    describe('when bottom item is selected', () => {
      let actual
      beforeEach(() => {
        actual = reducer({ list: [b1, b2, b3], selected: 2 }, action)
      })

      it('should select the bottom item', () => {
        expect(actual.selected).toBe(1)
      })
    })

    describe('when the only item is selected', () => {
      const actual = reducer({ list: [b1], selected: 0 }, action)

      it('should select nothing', () => {
        expect(actual.selected).toBe(-1)
      })
    })
  })

  describe('clear', () => {
    const actual = reducer({ list: [b1, b2], selected: 1 }, actions.clear)

    it('should clear the list', () => {
      expect(actual.list).toEqual([])
    })

    it('should select nothing', () => {
      expect(actual.selected).toEqual(-1)
    })
  })

  describe('updateAsPrinted', () => {
    describe('pending', () => {
      const state = reducer({ pending: false }, updateAsPrinted.pending())
      expect(state.pending).toBe(true)
    })

    describe('fulfilled', () => {
      const state = reducer({ pending: false }, updateAsPrinted.fulfilled())
      expect(state.pending).toBe(false)
      expect(state.printed).toBe(true)
    })

    describe('rejected', () => {
      const state = reducer({ pending: false }, updateAsPrinted.rejected())
      expect(state.pending).toBe(false)
    })
  })
})

describe('updateAsPrinted thunk', () => {
  beforeEach(() => {
    Sheet.belongings.update = jest.fn()
    Sheet.storages.update = jest.fn()
  })

  describe('when belongings in the list', () => {
    let action
    beforeEach(() => {
      action = updateAsPrinted([b1, b2])
    })

    it('calls Sheet.belongings.update', async () => {
      await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.belongings.update).toHaveBeenCalledWith(b1)
      expect(Sheet.belongings.update).toHaveBeenCalledWith(b2)
    })
  })

  describe('when storages in the list', () => {
    let action
    beforeEach(() => {
      action = updateAsPrinted([s1, s2])
    })

    it('calls Sheet.storages.update', async () => {
      await action(jest.fn(), jest.fn(), undefined)

      expect(Sheet.storages.update).toHaveBeenCalledWith(s1)
      expect(Sheet.storages.update).toHaveBeenCalledWith(s2)
    })
  })
})
