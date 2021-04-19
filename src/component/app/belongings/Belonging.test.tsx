import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import Belonging from './Belonging'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'

const setMockState = (belonging) => {
  const mockState = {
    belongings: {
      pending: false,
      list: [belonging]
    }
  }

  jest.spyOn(ReactRedux, 'useSelector').mockImplementation((selector) => selector(mockState))
}

const mockItem = {
  id: 'itemuuid',
  klass: 'belonging',
  name: 'itemname',
  description: 'itemdescription',
  storageId: null,
  quantities: 1,
  printed: false
}

const renderIt = () => {
  render(
    <Provider store={ store }>
      <ConnectedRouter history={ history }>
        <Belonging />
      </ConnectedRouter>
    </Provider>
  )
}

describe('Belonging', () => {
  let getThunk

  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
      fileId: 'file-id',
      itemId: 'itemid'
    })
    getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
    setMockState(mockItem)
  })

  describe('initialize', () => {
    it('should get belonging by provided ID', () => {
      renderIt()
      expect(getThunk).toHaveBeenCalledWith('itemid')
    })
  })

  describe('update operation', () => {
    it('should update the item with input', () => {
      const updateThunk = jest.spyOn(belongingsAsyncThunk, 'update')
      renderIt()

      const nameField = screen.getByLabelText('name').querySelector("input")
      userEvent.type(nameField, 'addedname')

      const descriptionField = screen.getByLabelText('description').querySelector("input")
      userEvent.type(descriptionField, 'addeddescription')

      const updateButton = screen.getByLabelText('update')
      userEvent.click(updateButton)

      expect(updateThunk).toHaveBeenCalledWith([{
        ...mockItem,
        name: mockItem.name + 'addedname',
        description: mockItem.description + 'addeddescription'
      }])
    })
  })
})
