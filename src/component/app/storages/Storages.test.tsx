import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Storages from './Storages'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'

Sheet.init = jest.fn()

describe('Storages', () => {
  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    jest.spyOn(Sheet.storages, 'search').mockResolvedValue([])
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderIt = () => {
    render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Storages />
        </ConnectedRouter>
      </Provider>
    )
  }

  describe('buttons', () => {
    const item = {
      klass: 'storage',
      name: '',
      description: '',
      printed: false,
    }

    let addThunk
    beforeEach(() => {
      addThunk = jest.spyOn(storagesAsyncThunk, 'add')
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
