import { Belonging } from './types'
import { Sheet } from '../api/sheet'
import { listSliceAndThunks } from './listSlice'

type State = {
  list: Belonging[]
  pending: boolean
  page: number
  nextPage: boolean
}

const initialState: State = {
  list: [],
  pending: false,
  page: 0,
  nextPage: false,
}

const elements = listSliceAndThunks({
  initialState: initialState,
  baseName: 'belongings',
  api: Sheet.belongings,
})

export const belongingsAsyncThunk = elements.thunks
export const belongingsSlice = elements.slice
