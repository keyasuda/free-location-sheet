import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WarehouseItem } from './types';
import { Sheet } from '../api/sheet';

type State = {
  list: WarehouseItem[],
  selected: number
}

const initialState: State = {
  list: [],
  selected: -1,
  printed: false,
  pending: false
}

// update all items as printed
export const updateAsPrinted = createAsyncThunk(
  'printQueue/updateAsPrinted',
  async (items, _thunkApi) => {
    for(let i of items) {
      switch(i.klass) {
        case 'belonging':
          await Sheet.belongings.update(i);
          break;

        case 'storage':
          await Sheet.storages.update(i);
          break;
      }
    }
  }
)

export const printQueueSlice = createSlice({
  name: 'printQueue',
  initialState,
  reducers: {
    add(state, action: PayloadAction<WarehouseItem[]>) {
      const list = state.list
      action.payload.map((i) => {
        if (!list.some((e) => e.id == i.id)) {
          list.push(i)
        }
      })
    },

    remove(state) {
      if(state.selected > -1) {
        state.list[state.selected] = null
        state.list = state.list.filter((e) => e)

        if(state.list.length - 1 < state.selected) {
          state.selected = state.list.length - 1
        }
      }
    },

    clear(state) {
      state.list = []
      state.selected = -1
    }
  },

  extraReducers: (builder) => {
    builder.addCase(updateAsPrinted.pending, (state, action) => {
      state.pending = true
    })

    builder.addCase(updateAsPrinted.fulfilled, (state, action) => {
      state.pending = false;
      state.printed = true;
    })

    builder.addCase(updateAsPrinted.rejected, (state, action) => {
      state.pending = false;
    })
  }
})
