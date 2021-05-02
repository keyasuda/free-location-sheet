import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
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
import AppBar from '../AppBar'

const setMockState = (belonging) => {
  const mockState = {
    belongings: {
      pending: false,
      list: [belonging],
    },
    storages: { pending: false, list: [] },
    router: {
      location: {
        query: {},
        pathname: '/app/file-id/',
      },
    },
  }

  jest
    .spyOn(ReactRedux, 'useSelector')
    .mockImplementation((selector) => selector(mockState))
}

const mockItem = {
  id: 'itemuuid',
  klass: 'belonging',
  name: 'itemname',
  description: 'itemdescription',
  storageId: null,
  quantities: 1,
  printed: false,
}

const renderIt = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Belonging />
      </ConnectedRouter>
    </Provider>
  )
}

let codeReaderOnRead
const MockCodeReader = (props) => {
  const { onRead } = props
  codeReaderOnRead = onRead

  return <div aria-label="camera selector">code reader</div>
}

jest.mock('../CodeReader', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('../AppBar', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

describe('Belonging', () => {
  let getThunk

  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
    AppBar.mockImplementation(() => <></>)
  })

  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
      fileId: 'file-id',
      itemId: mockItem.id,
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
    it('should update with the dialog', async () => {
      const updateThunk = jest.spyOn(belongingsAsyncThunk, 'update')
      renderIt()
      const editButton = screen.getByLabelText('edit')
      userEvent.click(editButton)
      await waitFor(() => screen.findByText('物品の編集'))

      const nameField = screen.getByLabelText('name').querySelector('input')
      userEvent.type(nameField, 'addedname')

      const descriptionField = screen
        .getByLabelText('description')
        .querySelector('input')
      userEvent.type(descriptionField, 'addeddescription')

      const updateButton = screen.getByLabelText('update')
      userEvent.click(updateButton)

      expect(updateThunk).toHaveBeenCalledWith([
        {
          ...mockItem,
          name: mockItem.name + 'addedname',
          description: mockItem.description + 'addeddescription',
        },
      ])
    })
  })

  describe('when it has storageId', () => {
    beforeEach(() => {
      setMockState({ ...mockItem, storageId: 'storageid' })
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
      id: 'storageuuid',
    }

    let thunk
    beforeEach(async () => {
      thunk = jest.spyOn(belongingsAsyncThunk, 'update')
      setMockState(mockItem)
      renderIt()
      const scanButton = screen.getByLabelText('set storage')
      userEvent.click(scanButton)
    })

    it('should set storage ID', () => {
      act(() => codeReaderOnRead(JSON.stringify(codeSrc)))
      expect(thunk).toHaveBeenCalledWith([
        { ...mockItem, storageId: codeSrc.id },
      ])
      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.queryByLabelText('camera selector')).toBeNull()
    })

    it('shouldnt set ID when belongings code was read', async () => {
      act(() =>
        codeReaderOnRead(JSON.stringify({ ...codeSrc, klass: 'belongings' }))
      )

      expect(thunk).not.toHaveBeenCalled()
      await waitFor(() => screen.findByRole('alert'))
      screen.getByText('保管場所のコードを読み取って下さい')
      screen.getByLabelText('camera selector')
    })

    it('shouldnt set ID when unknown code was read', async () => {
      act(() => codeReaderOnRead('unknowncode'))

      expect(thunk).not.toHaveBeenCalled()
      await waitFor(() => screen.findByRole('alert'))
      screen.getByText('保管場所のコードを読み取って下さい')
      screen.getByLabelText('camera selector')
    })
  })

  describe('unknown ID', () => {
    let push
    beforeEach(() => {
      jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
        fileId: 'file-id',
        itemId: 'itemid',
      })
      push = jest.spyOn(history, 'push')
      setMockState(null, true)
      renderIt()
    })

    it('should show a register dialog', () => {
      screen.getByText('物品の追加')
      screen.getByLabelText('add')
    })

    it('should add the item as a new belonging', () => {
      const button = screen.getByLabelText('add')
      const addThunk = jest.spyOn(belongingsAsyncThunk, 'add')
      const getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
      userEvent.click(button)

      expect(addThunk).toHaveBeenCalledWith([
        {
          ...mockItem,
          id: 'itemid',
          name: '',
          description: '',
          storageId: null,
          quantities: 1,
          printed: true, // unknown code has scanned - the code is already on somewhere
        },
      ])
    })

    it('should navigate to AppMenu when it has cancelled', () => {
      const button = screen.getByLabelText('cancel')
      userEvent.click(button)
      expect(push).toHaveBeenCalledWith('/app/file-id')
    })
  })
})
