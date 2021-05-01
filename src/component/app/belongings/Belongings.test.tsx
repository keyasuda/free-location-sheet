import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Belongings from './Belongings'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'

const setMockState = (keyword, belongings) => {
  const mockState = {
    router: {
      location: {
        query: {
          keyword: keyword,
        },
        pathname: '/app/file-id/belongings',
      },
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

const mockItem = {
  klass: 'belonging',
  name: '',
  description: '',
  storageId: null,
  quantities: 1,
  printed: false,
}

describe('Belongings', () => {
  let sheetInit, searchThunk
  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    sheetInit = jest.spyOn(Sheet, 'init').mockReturnValue('hogehoge')
    jest.spyOn(Sheet.belongings, 'search').mockResolvedValue([])
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    searchThunk = jest.spyOn(belongingsAsyncThunk, 'search')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderIt = () => {
    render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Belongings />
        </ConnectedRouter>
      </Provider>
    )
  }

  describe('data to show', () => {
    describe('without keywords', () => {
      beforeEach(() => {
        setMockState('', [])
        renderIt()
      })

      it('initializes Sheet API accessor', () => {
        expect(sheetInit).toHaveBeenCalled()
      })

      it('dispatch search action without keywords', async () => {
        expect(searchThunk).toHaveBeenCalledWith('')
      })
    })

    describe('with keywords', () => {
      beforeEach(() => {
        setMockState('searchword', [])
        renderIt()
      })

      it('dispatch search action with keywords', async () => {
        expect(searchThunk).toHaveBeenCalledWith('searchword')
      })
    })
  })

  describe('belongings list', () => {
    describe('items with name', () => {
      const items = [
        { ...mockItem, id: uuidv4(), name: 'itemname1' },
        { ...mockItem, id: uuidv4(), name: 'itemname2' },
      ]
      beforeEach(() => {
        setMockState('', items)
        renderIt()
      })

      it('should show item names', () => {
        items.map((i) => screen.getByText(i.name))
      })
    })

    describe('item without name', () => {
      beforeEach(() => {
        setMockState('', [{ ...mockItem, id: uuidv4() }])
        renderIt()
      })

      it('should show "(no name)"', () => {
        screen.getByText('(no name)')
      })
    })
  })

  describe('buttons', () => {
    const item = {
      klass: 'belonging',
      name: '',
      description: '',
      storageId: null,
      quantities: 1,
      printed: false,
    }

    let addThunk
    beforeEach(() => {
      addThunk = jest.spyOn(belongingsAsyncThunk, 'add')
      renderIt()
    })

    describe('bulk add button', () => {
      beforeEach(() => {
        const fab = screen.getByLabelText('add')
        userEvent.click(fab)
      })

      it('should add desired items', async () => {
        const num = 5

        await waitFor(() => screen.findByText('数量'))
        const amount = screen.getByLabelText('amount').querySelector('input')
        fireEvent.change(amount, { target: { value: String(num) } })
        userEvent.click(screen.getByLabelText('add bulk'))
        await waitFor(() => screen.findByText('数量'))

        expect(addThunk).toHaveBeenCalledWith(_.times(num, () => item))
      })

      it('should add nothing when the input is invalid', async () => {
        await waitFor(() => screen.findByText('数量'))
        const amount = screen.getByLabelText('amount').querySelector('input')
        userEvent.type(amount, 'hogehoge') // invalid input
        userEvent.click(screen.getByLabelText('add bulk'))
        await waitFor(() => screen.findByText('数量'))

        expect(addThunk).not.toHaveBeenCalled()
      })
    })
  })
})
