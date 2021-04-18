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
      <Provider store={ store }>
        <ConnectedRouter history={ history }>
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
      printed: false
    }

    beforeEach(() => renderIt())

    describe('add button', () => {
      it('should add an item', async () => {
        const addApi = jest.spyOn(Sheet.storages, 'add').mockResolvedValue([{...item, id: uuidv4()}])

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
        const api = jest.spyOn(Sheet.storages, 'add').mockResolvedValue(apiResult)

        await waitFor(() => screen.findByText('数量'))
        userEvent.type(screen.getByRole('textbox'), String(num))
        userEvent.click(screen.getAllByRole('button')[1])
        await waitFor(() => screen.findByText('数量'))

        expect(api).toHaveBeenCalledWith(apiArgs)
        expect(screen.getAllByText('(no name)').length).toBe(num)
      })

      it('should add nothing when the input is invalid', async () => {
        const api = jest.spyOn(Sheet.storages, 'add')

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
