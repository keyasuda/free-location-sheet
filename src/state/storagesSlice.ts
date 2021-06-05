import { Storage } from './types'
import { Sheet } from '../api/sheet'
import { listSliceAndThunks } from './listSlice'

type State = {
  list: Storage[]
  pending: boolean
  updating: boolean
  nextPage: boolean
  page: number
}

const initialState: Storage = {
  list: [],
  pending: false,
  updating: false,
  nextPage: false,
  page: 0,
}

const elements = listSliceAndThunks({
  initialState: initialState,
  baseName: 'storages',
  api: Sheet.storages,
})

export const storagesAsyncThunk = elements.thunks
export const storagesSlice = elements.slice
