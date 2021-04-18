import { belongingsSlice, belongingsAsyncThunk } from './belongingsSlice';
import { Belonging } from './types';
import { Sheet } from '../api/sheet';

let b1, b2, b3;
beforeEach(() => {
  b1 = {
    id: 'belonging-id-1',
    name: 'belonging 1',
    description: ''
  }

  b2 = {
    id: 'belonging-id-2',
    name: 'belonging 2',
    description: ''
  }

  b3 = {
    id: 'belonging-id-3',
    name: 'belonging 3',
    description: ''
  }
})

const reducer = belongingsSlice.reducer;
const actions = belongingsSlice.actions;

describe('belongings slice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {}).list).toEqual([])
  })

  describe('search', () => {
    const search = belongingsAsyncThunk.search;

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = search.pending();
        expect(reducer({pending: false}, action).pending).toBe(true);
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = search.fulfilled([b1]);
        const actual = reducer({list: [], pending: true}, action);

        expect(actual.list).toEqual([b1]);
        expect(actual.pending).toBe(false);
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = search.rejected();
        expect(reducer({pending: true}, action).pending).toBe(false);
      })
    })
  })

  describe('add', () => {
    const add = belongingsAsyncThunk.add;

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = add.pending();
        expect(reducer({pending: false}, action).pending).toBe(true);
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = add.fulfilled([b2]);
        const actual = reducer({list: [b1], pending: true}, action);

        expect(actual.list).toEqual([b1, b2]);
        expect(actual.pending).toBe(false);
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = add.rejected();
        expect(reducer({pending: true}, action).pending).toBe(false);
      })
    })
  })

  describe('get', () => {
    const get = belongingsAsyncThunk.get
    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = get.pending()
        expect(reducer({pending: false}, action).pending).toBe(true)
      })
    })

    describe('fulfilled', () => {
      it('should replace the current list with payload', () => {
        const action = get.fulfilled(b1)
        const actual = reducer({list: [], pending: true}, action)

        expect(actual.list).toEqual([b1])
        expect(actual.pending).toBe(false)
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = get.rejected()
        expect(reducer({pending: true}, action).pending).toBe(false)
      })
    })
  })

  describe('update', () => {
    const update = belongingsAsyncThunk.update;

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = update.pending();
        expect(reducer({pending: false}, action).pending).toBe(true);
      })
    })

    describe('fulfilled', () => {
      it('should update list item with payload if it exists', () => {
        const newBelongings = {
          ...b1,
          name: 'new name'
        }
        const action = update.fulfilled([newBelongings])
        const actual = reducer({'list': [b1], 'pending': true}, action);

        expect(actual.list[0].name).toEqual('new name')
        expect(actual.pending).toBe(false);
      })

      it('shouldnt update list item if it doesnt exist', () => {
        const newBelongings = {
          id: 'new id',
          name: 'new name'
        }
        const action = update.fulfilled([newBelongings])
        const actual = reducer({'list': [b1], 'pending': true}, action);

        expect(actual.list).toEqual([b1]);
        expect(actual.list[0].name).not.toEqual('new name');
        expect(actual.pending).toBe(false);
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = update.rejected();
        expect(reducer({pending: true}, action).pending).toBe(false);
      })
    })
  })

  describe('remove', () => {
    const thunk = belongingsAsyncThunk.remove;

    describe('pending', () => {
      it('should set state pending=true', () => {
        const action = thunk.pending();
        expect(reducer({pending: false}, action).pending).toBe(true);
      })
    })

    describe('fulfilled', () => {
      it('should remove the payload from the list', () => {
        const action = thunk.fulfilled(b1);
        const actual = reducer({list: [b1, b2], pending: true}, action);

        expect(actual.list).toEqual([b2]);
        expect(actual.pending).toBe(false);
      })
    })

    describe('rejected', () => {
      it('should set state pending=false', () => {
        const action = thunk.rejected();
        expect(reducer({pending: true}, action).pending).toBe(false);
      })
    })
  })
})

describe('async thunks', () => {
  let args, result, action, subject;

  describe('add', () => {
    const thunk = belongingsAsyncThunk.add;

    beforeEach(() => {
      args = [
        {name: b1.name, description: b1.description},
        {name: b2.name, description: b2.description}
      ]
      action = thunk(args);
      Sheet.belongings.add = jest.fn();
      Sheet.belongings.add.mockResolvedValue([b1, b2])
    })

    it('calls Sheet.belongings.add', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined);

      expect(Sheet.belongings.add).toHaveBeenCalledWith(args);
      expect(subject.payload).toEqual([b1, b2])
    })
  })

  describe('get', () => {
    const thunk = belongingsAsyncThunk.get;

    beforeEach(() => {
      args = 'id'
      action = thunk(args)
      Sheet.belongings.get = jest.fn()
      Sheet.belongings.get.mockResolvedValue(b1)
    })

    it('calls Sheet.belongings.get', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined);

      expect(Sheet.belongings.get).toHaveBeenCalledWith(args)
      expect(subject.payload).toEqual(b1)
    })
  })

  describe('search', () => {
    const thunk = belongingsAsyncThunk.search;

    beforeEach(() => {
      args = 'keyword';
      result = [b1, b3];
      action = thunk(args);
      Sheet.belongings.search = jest.fn();
      Sheet.belongings.search.mockResolvedValue(result);
    })

    it('calls Sheet.belongings.search', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined);

      expect(Sheet.belongings.search).toHaveBeenCalledWith(args);
      expect(subject.payload).toEqual(result);
    })
  })

  describe('update', () => {
    const thunk = belongingsAsyncThunk.update;

    beforeEach(() => {
      args = b1;
      result = b1;
      action = thunk(args);
      Sheet.belongings.update = jest.fn();
      Sheet.belongings.update.mockResolvedValue(result)
    })

    it('calls Sheet.belongings.update', async () => {
      subject = await action(jest.fn(), jest.fn(), undefined);

      expect(Sheet.belongings.update).toHaveBeenCalledWith(args);
      expect(subject.payload).toEqual(result);
    })
  })
})
