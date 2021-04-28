import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import PrintQueue from './PrintQueue'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import { store, history } from '../../../state/store'
import * as auth from '../../authentication'

const setMockState = (items) => {
  const mockState = {
    printQueue: {
      pending: false,
      list: items
    },
    storages: {
      pending: false,
      list: []
    },
    belongings: {
      pending: false,
      list: []
    }
  }

  jest.spyOn(ReactRedux, 'useSelector').mockImplementation((selector) => selector(mockState))
}

const mockBelonging = {
  id: 'belonginguuid',
  klass: 'belonging',
  name: 'itemname',
  description: 'itemdescription',
  storageId: null,
  quantities: 1,
  printed: false
}

const mockStorage = {
  id: 'storageuuid',
  klass: 'storage',
  name: 'itemname',
  description: 'itemdescription',
  printed: false
}

const renderIt = (mockState) => {
  setMockState(mockState)

  render(
    <Provider store={ store }>
      <ConnectedRouter history={ history }>
        <PrintQueue />
      </ConnectedRouter>
    </Provider>
  )
}

describe('PrintQueue', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
      fileId: 'file-id',
      itemId: 'itemid'
    })
  })

  describe('actions', () => {
    it('set as printed button should update enqueued items as printed', () => {
      const belongingsUpdate = jest.spyOn(belongingsAsyncThunk, 'update')
      const storagesUpdate = jest.spyOn(storagesAsyncThunk, 'update')

      renderIt([mockBelonging, mockStorage])
      const btn = screen.getByText('印刷済みにする')
      userEvent.click(btn)

      expect(belongingsUpdate).toHaveBeenCalledWith([{...mockBelonging, printed: true}])
      expect(storagesUpdate).toHaveBeenCalledWith([{...mockStorage, printed: true}])
    })
  })
})