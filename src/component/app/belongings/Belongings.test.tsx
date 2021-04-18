import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

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

  describe('buttons', () => {
    const item = {
      klass: 'belonging',
      name: '',
      description: '',
      storageId: null,
      quantities: 1,
      printed: false
    }

    beforeEach(() => renderIt())

    describe('add button', () => {
      it('should add an item', async () => {
        const addApi = jest.spyOn(Sheet.belongings, 'add').mockResolvedValue([{...item, id: uuidv4()}])

        await waitFor(() => screen.findByText('数量'))
        await userEvent.click(screen.getAllByRole('button')[0])
        await waitFor(() => screen.findByText('数量'))

        expect(addApi).toHaveBeenCalled()
        expect(screen.getAllByText('(no name)').length).toBe(1)
      })
    })

    describe('bulk add button', () => {
      it('should add desired items', async () => {
        const num = 5
        const apiArgs = _.times(num, () => item)
        const apiResult = apiArgs.map((i) => ({...i, id: uuidv4()}))
        const api = jest.spyOn(Sheet.belongings, 'add').mockResolvedValue(apiResult)

        await waitFor(() => screen.findByText('数量'))
        userEvent.type(screen.getByRole('textbox'), String(num))
        userEvent.click(screen.getAllByRole('button')[1])
        await waitFor(() => screen.findByText('数量'))

        expect(api).toHaveBeenCalledWith(apiArgs)
        expect(screen.getAllByText('(no name)').length).toBe(num)
      })

      it('should add nothing when the input is invalid', async () => {
        const api = jest.spyOn(Sheet.belongings, 'add')

        await waitFor(() => screen.findByText('数量'))
        userEvent.type(screen.getByRole('textbox'), 'hogehoge') // invalid input
        userEvent.click(screen.getAllByRole('button')[1])
        await waitFor(() => screen.findByText('数量'))

        expect(api).not.toHaveBeenCalled()
        expect(screen.queryByText('(no name)')).toBeNull()
      })
    })
  })
})
