import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter, Routes, Route } from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'

import { Sheet } from '../../../api/sheet'
import PrintQueue from './PrintQueue'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import * as auth from '../../authentication'
import AppBar from '../AppBar'

let mockPrint
let mockReactToPrintOptions

jest.mock('react-to-print', () => ({
  __esModule: true,
  default: () => null,
  useReactToPrint: (options) => {
    mockReactToPrintOptions = options
    return mockPrint
  },
}))

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

  return {
    getState: () => mockState,
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  }
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
  const mockStore = setMockState(belongings, storages)

  render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[initialPath]}>
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
    mockPrint = jest.fn()
    mockReactToPrintOptions = undefined
  })

  it('should retreive unprinted items', () => {
    renderIt([mockBelonging], [mockStorage])
    expect(bFindByPrinted).toHaveBeenCalledWith(false)
    expect(sFindByPrinted).toHaveBeenCalledWith(false)
  })

  describe('react-to-print v3', () => {
    it('should pass contentRef (not content) to useReactToPrint', () => {
      renderIt([mockBelonging], [mockStorage])

      expect(mockReactToPrintOptions).toBeDefined()
      expect(mockReactToPrintOptions.content).toBeUndefined()
      expect(mockReactToPrintOptions.contentRef).toBeDefined()
      expect(mockReactToPrintOptions.contentRef.current).not.toBeNull()
    })

    it('should render print content into the contentRef node', () => {
      renderIt([mockBelonging], [mockStorage])

      const contentNode = mockReactToPrintOptions.contentRef.current
      expect(contentNode).not.toBeNull()
      expect(
        within(contentNode).getAllByText('itemname').length
      ).toBeGreaterThan(0)
    })

    it('should call print function when the print button is clicked', async () => {
      const user = userEvent.setup()
      renderIt([mockBelonging], [mockStorage])

      await user.click(screen.getByLabelText('print'))

      expect(mockPrint).toHaveBeenCalled()
    })
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
