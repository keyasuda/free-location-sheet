import React from 'react'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'

import Storages from './Storages'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'

Sheet.init = jest.fn()

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ThemeProvider as StylesThemeProvider } from '@mui/styles'

const theme = createTheme()

describe('Storages', () => {
  beforeEach(() => {
    jest.spyOn(Sheet.storages, 'search').mockResolvedValue([])
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderIt = (initialPath = '/app/file-id/storages') => {
    render(
      <MuiThemeProvider theme={theme}>
        <StylesThemeProvider theme={theme}>
          <Provider store={store}>
            <MemoryRouter initialEntries={[initialPath]}>
              <Routes>
                <Route path="/app/:fileId/storages" element={<Storages />} />
              </Routes>
            </MemoryRouter>
          </Provider>
        </StylesThemeProvider>
      </MuiThemeProvider>
    )
  }

  describe('buttons', () => {
    const item = {
      klass: 'storage',
      name: '',
      description: '',
      printed: false,
    }

    let addThunk, user
    beforeEach(async () => {
      user = userEvent.setup()
      addThunk = jest.spyOn(storagesAsyncThunk, 'add')
      renderIt()
    })

    describe('bulk add button', () => {
      beforeEach(async () => {
        const fab = screen.getByLabelText('add')
        await user.click(fab)
      })

      it('should add desired items', async () => {
        const num = 5

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
  })
})
