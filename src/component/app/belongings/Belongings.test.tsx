import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Belongings from './Belongings'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'

describe('Belongings', () => {
  let initAuth, sheetInit, searchThunk;
  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    initAuth = jest.spyOn(auth, 'initAuth').mockResolvedValue(true)
    sheetInit = jest.spyOn(Sheet, 'init').mockReturnValue('hogehoge')
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    searchThunk = jest.spyOn(belongingsAsyncThunk, 'search')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderIt = () => {
    render(
      <Provider store={ store }>
        <ConnectedRouter history={ history }>
          <Belongings />
        </ConnectedRouter>
      </Provider>
    )
  }

  describe('without keywords', () => {
    beforeEach(() => renderIt())

    it('initializes Google auth', () => {
      expect(initAuth).toHaveBeenCalled()
    })

    it('initializes Sheet API accessor', async () => {
      await waitFor(() => expect(sheetInit).toHaveBeenCalled())
    })

    it('dispatch search action without keywords', async () => {
      await waitFor(() => expect(searchThunk).toHaveBeenCalledWith(''))
    })
  })

  describe('when its signed out', () => {
    it('will dispatch nothing', async () => {
      initAuth.mockResolvedValue(false)
      renderIt('/app/file-id/belongings')

      await waitFor(() => expect(sheetInit).not.toHaveBeenCalled())
    })
  })
})
