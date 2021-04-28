import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from "@testing-library/react-hooks"
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
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import CodeReader from '../CodeReader'

const setMockState = (belonging) => {
  const mockState = {
    belongings: {
      pending: false,
      list: [belonging]
    },
    storages: { pending: false, list: [] }
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

let codeReaderOnRead
const MockCodeReader = (props) => {
  const { onRead } = props
  codeReaderOnRead = onRead

  return <>code reader</>
}

jest.mock('../CodeReader', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn()
}))

describe('Belonging', () => {
  let getThunk

  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
  })

  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
      fileId: 'file-id',
      itemId: mockItem.id
    })
    getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
    setMockState(mockItem)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialize', () => {
    it('should get belonging by provided ID', () => {
      renderIt()
      expect(getThunk).toHaveBeenCalledWith(mockItem.id)
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

  describe('when it has storageId', () => {
    beforeEach(() => {
      setMockState({...mockItem, storageId: 'storageid'})
    })

    it('should get the storage', () => {
      const thunk = jest.spyOn(storagesAsyncThunk, 'get')
      renderIt()
      expect(thunk).toHaveBeenCalledWith('storageid')
    })
  })

  describe('when it doesnt have storageId', () => {
    beforeEach(() => {
      setMockState(mockItem)
    })

    it('should get the storage', () => {
      const thunk = jest.spyOn(storagesAsyncThunk, 'get')
      renderIt()
      expect(thunk).not.toHaveBeenCalled()
    })
  })

  describe('set storage ID', () => {
    const codeSrc = {
      klass: 'storage',
      id: 'storageuuid'
    }

    let thunk, closeFunc
    beforeEach(() => {
      thunk = jest.spyOn(belongingsAsyncThunk, 'update')
      closeFunc = jest.fn()
      setMockState(mockItem)
      renderIt()
    })

    it('should set storage ID', () => {
      codeReaderOnRead(JSON.stringify(codeSrc), closeFunc)

      expect(thunk).toHaveBeenCalledWith([{...mockItem, storageId: codeSrc.id}])
      expect(closeFunc).toHaveBeenCalled()
    })

    it('shouldnt set ID when belongings code was read', () => {
      act(() => codeReaderOnRead(JSON.stringify({...codeSrc, klass: 'belongings'}), closeFunc))

      expect(thunk).not.toHaveBeenCalled()
      expect(closeFunc).not.toHaveBeenCalled()
      screen.getByText('not a storage!')
    })

    it('shouldnt set ID when unknown code was read', async () => {
      act(() => codeReaderOnRead('unknowncode', closeFunc))

      expect(thunk).not.toHaveBeenCalled()
      expect(closeFunc).not.toHaveBeenCalled()
      screen.getByText('not a storage!')
    })

    it('should set blank ID when clear button has clicked', () => {
      const button = screen.getByLabelText('clear')
      userEvent.click(button)

      expect(thunk).toHaveBeenCalledWith([{...mockItem, storageId: null}])
    })
  })

  describe('unknown ID', () => {
    beforeEach(() => {
      jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
        fileId: 'file-id',
        itemId: 'itemid'
      })
      setMockState(null, true)
      renderIt()
    })

    it('should ask to add it or not', () => {
      screen.getByLabelText('add')
      expect(screen.queryByLabelText('update')).toBeNull()
    })

    it('should add the item as a new belonging', () => {
      const button = screen.getByLabelText('add')
      const addThunk = jest.spyOn(belongingsAsyncThunk, 'add')
      const getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
      userEvent.click(button)

      expect(addThunk).toHaveBeenCalledWith([{
        ...mockItem,
        id: 'itemid',
        name: '',
        description: '',
        storageId: null,
        quantities: 1,
        printed: true // unknown code has scanned - the code is already on somewhare
      }])
    })
  })
})
