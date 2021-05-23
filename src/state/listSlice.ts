import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export const listSliceAndThunks = (params) => {
  const initialState = params.initialState
  const baseName = params.baseName
  const api = params.api

  // add new items
  const add = createAsyncThunk(`${baseName}/add`, async (items, _thunkApi) => {
    const added = await api.add(items)
    return added
  })

  const get = createAsyncThunk(
    `${baseName}/get`,
    async (id: string, _thunkApi) => {
      return await api.get(id)
    }
  )

  // search existing items
  const search = createAsyncThunk(
    `${baseName}/search`,
    async (keyword: string, _thunkApi) => {
      return await api.search(keyword, 0)
    }
  )
  const searchNext = createAsyncThunk(
    `${baseName}/searchNext`,
    async (params, thunkApi) => {
      const { keyword, page } = params
      return await api.search(keyword, page)
    }
  )

  // find by printed
  const findByPrinted = createAsyncThunk(
    `${baseName}/findByPrinted`,
    async (printed: boolean, _thunkApi) => {
      return await api.findByPrinted(printed)
    }
  )

  // update existing item
  const update = createAsyncThunk(
    `${baseName}/update`,
    async (item, _thunkApi) => {
      return await api.update(item)
    }
  )

  // remove existing item
  const remove = createAsyncThunk(
    `${baseName}/remove`,
    async (item, _thunkApi) => {
      await api.delete(item.id)
      return item
    }
  )

  const thunks = { add, get, search, searchNext, findByPrinted, update, remove }

  const pend = (state, _) => {
    state.pending = true
  }
  const fix = (state, _) => {
    state.pending = false
  }

  const slice = createSlice({
    name: baseName,
    initialState,
    extraReducers: (builder) => {
      ;[add, get, search, findByPrinted, update, remove].forEach((t) => {
        builder.addCase(t.pending, pend)
        builder.addCase(t.rejected, fix)
      })

      builder.addCase(add.fulfilled, (state, action) => {
        state.list = [...action.payload, ...state.list]
        state.pending = false
      })

      builder.addCase(get.fulfilled, (state, action) => {
        const payload = action.payload
        if (payload) {
          state.list = [payload]
        } else {
          state.list = []
        }
        state.pending = false
      })

      builder.addCase(search.fulfilled, (state, action) => {
        const payload = action.payload
        state.list = payload.items
        state.page = payload.page
        state.nextPage = payload.nextPage
        state.pending = false
      })

      builder.addCase(searchNext.fulfilled, (state, action) => {
        const payload = action.payload
        state.list = [...state.list, ...payload.items]
        state.page = payload.page
        state.nextPage = payload.nextPage
        state.pending = false
      })

      builder.addCase(findByPrinted.fulfilled, (state, action) => {
        state.list = action.payload
        state.pending = false
      })

      builder.addCase(update.fulfilled, (state, action) => {
        const payload = action.payload
        payload.map((item) => {
          const index = state.list.map((b) => b.id).indexOf(item.id)

          if (index > -1) {
            state.list[index] = item
          }
        })

        state.pending = false
      })

      builder.addCase(remove.fulfilled, (state, action) => {
        const payload = action.payload
        state.list = state.list.filter((e) => e.id != payload.id)
        state.pending = false
      })

      builder.addCase('@@router/LOCATION_CHANGE', (state, action) => {
        state.list = []
      })
    },
  })

  return { thunks, slice }
}
