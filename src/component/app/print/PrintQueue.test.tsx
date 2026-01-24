import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'

import { Sheet } from '../../../api/sheet'
import PrintQueue from './PrintQueue'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import { store, history } from '../../../state/store'
import * as auth from '../../authentication'
import AppBar from '../AppBar'

Sheet.init = jest.fn()

const setMockState = (belongings, storages) => {
  const mockState = {
    storages: {
      pending: false,
      list: storages,
    },
    belongings: {
      pending: false,
      list: belongings,
    },
  }

  jest
    .spyOn(ReactRedux, 'useSelector')
    .mockImplementation((selector) => selector(mockState))
}

const mockBelonging = {
  id: 'belonginguuid',
  klass: 'belonging',
  name: 'itemname',
  description: 'itemdescription',
  storageId: null,
  quantities: 1,
  printed: false,
}

const mockStorage = {
  id: 'storageuuid',
  klass: 'storage',
  name: 'itemname',
  description: 'itemdescription',
  printed: false,
}

const renderIt = (
  belongings,
  storages,
  initialPath = '/app/file-id/itemid'
) => {
  setMockState(belongings, storages)

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]} history={history}>
        <Routes>
          <Route path="/app/:fileId/:itemId" element={<PrintQueue />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

jest.mock('../AppBar', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

describe('PrintQueue', () => {
  let bFindByPrinted, sFindByPrinted

  beforeAll(() => {
    AppBar.mockImplementation(() => <></>)
  })

  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    bFindByPrinted = jest.spyOn(belongingsAsyncThunk, 'findByPrinted')
    sFindByPrinted = jest.spyOn(storagesAsyncThunk, 'findByPrinted')
  })

  it('should retreive unprinted items', () => {
    renderIt([mockBelonging], [mockStorage])
    expect(bFindByPrinted).toHaveBeenCalledWith(false)
    expect(sFindByPrinted).toHaveBeenCalledWith(false)
  })

  describe('actions', () => {
    it('set as printed button should update enqueued items as printed', async () => {
      const user = userEvent.setup()
      const belongingsUpdate = jest.spyOn(belongingsAsyncThunk, 'update')
      const storagesUpdate = jest.spyOn(storagesAsyncThunk, 'update')

      renderIt([mockBelonging], [mockStorage])
      await user.click(screen.getByLabelText('print'))
      const btn = screen.getByLabelText('mark as printed')
      await user.click(btn)

      expect(belongingsUpdate).toHaveBeenCalledWith([
        { ...mockBelonging, printed: true },
      ])
      expect(storagesUpdate).toHaveBeenCalledWith([
        { ...mockStorage, printed: true },
      ])
    })
  })
})
