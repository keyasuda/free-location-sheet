import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Belonging } from './types';
import { Sheet } from '../api/sheet';

type State = {
  list: Belonging[],
  pending: boolean
}

const initialState = {
  list: [],
  pending: false
}

// add new belonging(s)
const add = createAsyncThunk(
  'belongings/add',
  async (belongings: Belonging[], _thunkApi) => {
    await Sheet.belongings.add(belongings);
    return belongings
  }
)

// search existing belonging(s)
const search = createAsyncThunk(
  'belongings/search',
  async (keyword: string, _thunkApi) => {
    const belongings = await Sheet.belongings.search(keyword);
    return belongings
  }
)

// update existing item
const update = createAsyncThunk(
  'belongings/update',
  async (belonging, _thunkApi) => {
    const updated = await Sheet.belongings.update(belonging);
    return updated
  }
)

const remove = createAsyncThunk(
  'belongings/remove',
  async (belonging, _thunkApi) => {
    const updated = await Sheet.belongings.update(belonging);
    return updated
  }
)

export const belongingsAsyncThunk = { add, search, update, remove }

const pend = (state, _) => { state.pending = true }
const fix = (state, _) => { state.pending = false }

export const belongingsSlice = createSlice({
  name: 'belongings',
  initialState,
  extraReducers: (builder) => {
    [add, search, update, remove].forEach((t) => {
      builder.addCase(t.pending, pend);
      builder.addCase(t.rejected, fix);
    })

    builder.addCase(add.fulfilled, (state, action) => {
      state.list = [...state.list, ...action.payload]
      state.pending = false;
    })

    builder.addCase(search.fulfilled, (state, action) => {
      state.list = action.payload;
      state.pending = false;
    })

    builder.addCase(update.fulfilled, (state, action) => {
      const payload = action.payload;
      const index = state.list.map((b) => b.id).indexOf(payload.id);

      if (index > -1) {
        state.list[index] = action.payload;
      }

      state.pending = false;
    })

    builder.addCase(remove.fulfilled, (state, action) => {
      const payload = action.payload;
      state.list = state.list.filter((e) => e.id != payload.id);
      state.pending = false;
    })
  }
});
