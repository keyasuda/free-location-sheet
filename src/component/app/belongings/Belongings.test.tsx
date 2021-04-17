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
  let sheetInit, searchThunk;
  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
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

    it('initializes Sheet API accessor', () => {
      expect(sheetInit).toHaveBeenCalled()
    })

    it('dispatch search action without keywords', async () => {
      expect(searchThunk).toHaveBeenCalledWith('')
    })
  })
})
