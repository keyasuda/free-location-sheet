import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit'
import { createReduxHistoryContext } from 'redux-first-history'
import { createBrowserHistory } from 'history'

import { belongingsSlice } from './belongingsSlice'
import { storagesSlice } from './storagesSlice'

const { createReduxHistory, routerMiddleware, routerReducer } =
  createReduxHistoryContext({ history: createBrowserHistory() })

export const store = configureStore({
  reducer: combineReducers({
    router: routerReducer,
    belongings: belongingsSlice.reducer,
    storages: storagesSlice.reducer,
  }),
  middleware: [...getDefaultMiddleware(), routerMiddleware],
})

export const history = createReduxHistory(store)
