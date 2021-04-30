import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'

import { belongingsSlice } from './belongingsSlice'
import { storagesSlice } from './storagesSlice'
import { printQueueSlice } from './printQueueSlice'

export const history = createBrowserHistory()

const reducer = combineReducers({
  router: connectRouter(history),
  belongings: belongingsSlice.reducer,
  storages: storagesSlice.reducer,
  printQueue: printQueueSlice.reducer,
})

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(routerMiddleware(history))
  },
})
