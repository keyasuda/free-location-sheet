import React from 'react'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'

import Belongings from './Belongings'
import * as auth from '../../authentication'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { Sheet } from '../../../api/sheet'
Sheet.init = jest.fn()

const setMockState = (params) => {
  const { keyword, belongings, deadline } = params
  const search = new URLSearchParams()
  if (keyword) search.append('keyword', keyword)
  if (deadline) search.append('deadline', deadline)

  const mockState = {
    router: {
      location: {
        search: search.toString(),
        pathname: '/app/file-id/belongings',
      },
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

const mockItem = {
  klass: 'belonging',
  name: '',
  description: '',
  storageId: null,
  quantities: 1,
  printed: false,
}

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}))

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

const theme = createTheme()

describe('Belongings', () => {
  let sheetInit, searchThunk, user
  beforeEach(() => {
    user = userEvent.setup()
    sheetInit = jest.spyOn(Sheet, 'init').mockReturnValue('hogehoge')
    jest.spyOn(Sheet.belongings, 'search').mockResolvedValue([])
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    searchThunk = jest.spyOn(belongingsAsyncThunk, 'search')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderIt = (store, initialPath = '/app/file-id/belongings') => {
    // Check if store is actually a path string (legacy call support or convenience)
    let actualStore = store
    let actualPath = initialPath

    if (typeof store === 'string' || store === undefined) {
       actualPath = store || '/app/file-id/belongings'
       actualStore = setMockState({ keyword: '', belongings: [], deadline: null })
    }

    render(
      <MuiThemeProvider theme={theme}>
          <Provider store={actualStore}>
            <MemoryRouter initialEntries={[actualPath]}>
              <Routes>
                <Route path="/app/:fileId/belongings" element={<Belongings />} />
              </Routes>
            </MemoryRouter>
          </Provider>
      </MuiThemeProvider>
    )
  }

  describe('data to show', () => {
    describe('without keywords', () => {
      beforeEach(() => {
        const store = setMockState({ keyword: '', belongings: [], deadline: null })
        renderIt(store)
      })

      it('initializes Sheet API accessor', () => {
        expect(sheetInit).toHaveBeenCalled()
      })

      it('dispatch search action without keywords', async () => {
        expect(searchThunk).toHaveBeenCalledWith({
          keyword: '',
          page: 0,
          deadline: false,
        })
      })
    })

    describe('with keywords', () => {
      beforeEach(() => {
        const store = setMockState({ keyword: 'searchword', belongings: [], deadline: null })
        renderIt(store, '/app/file-id/belongings?keyword=searchword')
      })

      it('dispatch search action with keywords', async () => {
        expect(searchThunk).toHaveBeenCalledWith({
          keyword: 'searchword',
          page: 0,
          deadline: false,
        })
      })
    })

    describe('search by deadline', () => {
      describe('with keyword', () => {
        it('should dispatch search action with keywords and deadline=true', () => {
          const store = setMockState({
            keyword: 'searchword',
            belongings: [],
            deadline: true,
          })
          renderIt(store, '/app/file-id/belongings?keyword=searchword&deadline=true')
          expect(searchThunk).toHaveBeenCalledWith({
            keyword: 'searchword',
            page: 0,
            deadline: true,
          })
        })
      })

      describe('without keywords', () => {
        it('should dispatch search action with keywords and deadline=true', () => {
          const store = setMockState({ keyword: '', belongings: [], deadline: true })
          renderIt(store, '/app/file-id/belongings?deadline=true')
          expect(searchThunk).toHaveBeenCalledWith({
            keyword: '',
            page: 0,
            deadline: true,
          })
        })
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
        const store = setMockState({ keyword: '', belongings: items })
        renderIt(store)
      })

      it('should show item names', () => {
        items.map((i) => screen.getByText(i.name))
      })
    })

    describe('item without name', () => {
      beforeEach(() => {
        const store = setMockState({
          keyword: '',
          belongings: [{ ...mockItem, id: uuidv4() }],
        })
        renderIt(store)
      })

      it('should show "(名称未設定)"', () => {
        screen.getByText('(名称未設定)')
      })
    })
  })

  describe('buttons', () => {
    describe('bulk add button', () => {
      const item = {
        klass: 'belonging',
        name: '',
        description: '',
        storageId: null,
        quantities: 1,
        printed: false,
      }

      let addThunk
      beforeEach(async () => {
        addThunk = jest.spyOn(belongingsAsyncThunk, 'add')
        renderIt()
        const fab = screen.getByLabelText('add')
        await user.click(fab)
      })

      it('should add desired items', async () => {
        const num = 5

        const fab = screen.getByLabelText('add')
        await user.click(fab)

        await screen.findByRole('dialog')
        const amount = screen.getByLabelText('amount').querySelector('input')
        fireEvent.change(amount, { target: { value: String(num) } })
        await user.click(screen.getByLabelText('add bulk'))
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))

        expect(addThunk).toHaveBeenCalledWith(_.times(num, () => item))
      })

      it('should add nothing when the input is invalid', async () => {
        await screen.findByRole('dialog')
        const amount = screen.getByLabelText('amount').querySelector('input')
        await user.type(amount, 'hogehoge') // invalid input
        await user.click(screen.getByLabelText('add bulk'))
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))

        expect(addThunk).not.toHaveBeenCalled()
      })
    })

    describe('filter button', () => {
      describe('without keywords', () => {
        it('should apply deadline filter', async () => {
          const store = setMockState({
            keyword: '',
            belongings: [],
          })
          renderIt(store)

          const chip = screen.getByLabelText('search-by-deadline')
          await user.click(chip)

          expect(mockUseNavigate).toHaveBeenCalledWith(
            '/app/file-id/belongings?deadline=true'
          )
        })

        it('should clear filter when its already applied', async () => {
          const store = setMockState({
            keyword: '',
            deadline: true,
            belongings: [],
          })
          renderIt(store, '/app/file-id/belongings?deadline=true')

          const chip = screen.getByLabelText('search-by-deadline')
          await user.click(chip)

          expect(mockUseNavigate).toHaveBeenCalledWith(
            '/app/file-id/belongings'
          )
        })
      })

      describe('with keywords', () => {
        it('should apply deadline filter', async () => {
          const store = setMockState({
            keyword: 'word',
            belongings: [],
          })
          renderIt(store, '/app/file-id/belongings?keyword=word')

          const chip = screen.getByLabelText('search-by-deadline')
          await user.click(chip)

          expect(mockUseNavigate).toHaveBeenCalledWith(
            '/app/file-id/belongings?keyword=word&deadline=true'
          )
        })

        it('should clear filter when its already applied', async () => {
          const store = setMockState({
            keyword: 'word',
            deadline: true,
            belongings: [],
          })
          renderIt(store, '/app/file-id/belongings?keyword=word&deadline=true')

          const chip = screen.getByLabelText('search-by-deadline')
          await user.click(chip)

          expect(mockUseNavigate).toHaveBeenCalledWith(
            '/app/file-id/belongings?keyword=word'
          )
        })
      })
    })
  })
})
