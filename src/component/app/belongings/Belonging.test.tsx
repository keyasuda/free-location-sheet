import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
const fetchMock = require('fetch-mock-jest')

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'

import Belonging from './Belonging'
import * as auth from '../../authentication'
import { store, history } from '../../../state/store'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import CodeReader from '../CodeReader'
import AppBar from '../AppBar'

import { autoFillEndpoint } from '../../../settings'

Sheet.init = jest.fn()

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

const renderIt = (itemId) => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/file-id/${itemId}`]} history={history}>
        <Routes>
          <Route path="/:fileId/:itemId" element={<Belonging />} />
        </Routes>
      </MemoryRouter>
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

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
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
    getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
    setMockState(mockItem)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialize', () => {
    it('should get belonging by provided ID', () => {
      renderIt(mockItem.id)
      expect(getThunk).toHaveBeenCalledWith(mockItem.id)
    })
  })

  describe('update operation', () => {
    it('should update with the dialog', async () => {
      const user = userEvent.setup()
      const updateThunk = jest.spyOn(belongingsAsyncThunk, 'update')
      renderIt(mockItem.id)
      const editButton = screen.getByLabelText('edit')
      await user.click(editButton)
      await waitFor(() => screen.findByText('物品の編集'))

      const nameField = screen.getByLabelText('name').querySelector('input')
      await user.clear(nameField)
      await user.type(nameField, 'addedname')

      const descriptionField = screen
        .getByLabelText('description')
        .querySelector('input')
      await user.clear(descriptionField)
      await user.type(descriptionField, 'addeddescription')

      const updateButton = screen.getByLabelText('done')
      await user.click(updateButton)

      expect(updateThunk).toHaveBeenCalledWith([
        {
          ...mockItem,
          name: 'addedname',
          description: 'addeddescription',
          deadline: '',
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
      renderIt(mockItem.id)
      expect(thunk).toHaveBeenCalledWith('storageid')
    })
  })

  describe('when it doesnt have storageId', () => {
    beforeEach(() => {
      setMockState(mockItem)
    })

    it('should get the storage', () => {
      const thunk = jest.spyOn(storagesAsyncThunk, 'get')
      renderIt(mockItem.id)
      expect(thunk).not.toHaveBeenCalled()
    })
  })

  describe('set storage ID', () => {
    const codeSrc = {
      klass: 'storage',
      id: 'storageuuid',
    }

    let thunk, user
    beforeEach(async () => {
      user = userEvent.setup()
      thunk = jest.spyOn(belongingsAsyncThunk, 'update')
      setMockState(mockItem)
      renderIt(mockItem.id)
      const scanButton = screen.getByLabelText('set storage')
      await user.click(scanButton)
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
    beforeEach(() => {
      setMockState(null, true)
      renderIt('itemid')
    })

    it('should show a register dialog', () => {
      screen.getByText('物品の追加')
      screen.getByLabelText('done')
    })

    it('should add the item as a new belonging', async () => {
      const user = userEvent.setup()
      const button = screen.getByLabelText('done')
      const addThunk = jest.spyOn(belongingsAsyncThunk, 'add')
      const getThunk = jest.spyOn(belongingsAsyncThunk, 'get')
      await user.click(button)

      expect(addThunk).toHaveBeenCalledWith([
        {
          ...mockItem,
          id: 'itemid',
          name: '',
          description: '',
          storageId: null,
          quantities: 1,
          printed: true, // unknown code has scanned - the code is already on somewhere
          deadline: '',
        },
      ])
    })

    it('should navigate to AppMenu when it has cancelled', async () => {
      const user = userEvent.setup()
      const button = screen.getByLabelText('cancel')
      await user.click(button)

      expect(mockUseNavigate).toHaveBeenCalledWith('/app/file-id')
    })
  })

  describe('remove button', () => {
    it('should remove item and redirect to belongings', async () => {
      const user = userEvent.setup()
      const removeThunk = jest.spyOn(belongingsAsyncThunk, 'remove')

      renderIt(mockItem.id)

      const removeButton = screen.getByLabelText('remove')
      await user.click(removeButton)

      await waitFor(() => screen.findByText('物品の削除'))

      const okButton = screen.getByLabelText('proceed-remove')
      await user.click(okButton)

      expect(removeThunk).toHaveBeenCalledWith(mockItem)
      expect(mockUseNavigate).toHaveBeenCalledWith('/app/file-id/belongings')
    })
  })

  describe('autofill button', () => {
    it('shouldnt appear for existing item', () => {
      setMockState(mockItem)
      renderIt(mockItem.id)
      const button = screen.queryByLabelText('autofill-button')
      expect(button).toEqual(null)
    })

    it('should appear for new item', () => {
      setMockState(null)
      renderIt('new-item')
      screen.getByLabelText('autofill-button')
    })

    describe('clicks', () => {
      afterEach(() => fetchMock.restore())

      it('should call backend and fill when something has returned', async () => {
        const user = userEvent.setup()
        const autofillSource = {
          name: 'autofill item name',
          url: 'autofill item url',
        }

        fetchMock.get(autoFillEndpoint + '1145141841842', {
          status: 200,
          body: JSON.stringify(autofillSource),
        })

        setMockState(null)
        renderIt('barcode1145141841842')
        const button = screen.getByLabelText('autofill-button')

        await user.click(button)

        const nameField = screen.getByLabelText('name').querySelector('input')
        const descriptionField = screen
          .getByLabelText('description')
          .querySelector('input')

        await waitFor(() =>
          expect(nameField.value).toEqual(autofillSource.name)
        )
        expect(descriptionField.value).toEqual(autofillSource.url)
      })

      it('should show notice when therere no autofill values', async () => {
        const user = userEvent.setup()
        fetchMock.get(autoFillEndpoint + '1145141841842', {
          status: 404,
          body: 'not found',
        })

        setMockState(null)
        renderIt('barcode1145141841842')
        const button = screen.getByLabelText('autofill-button')

        await user.click(button)

        await waitFor(() => screen.getByText('自動入力できませんでした'))
      })

      it('should call OpenBD for ISBN', async () => {
        const user = userEvent.setup()
        const autofillSource = [
          {
            onix: {
              DescriptiveDetail: {
                TitleDetail: {
                  TitleElement: {
                    TitleText: {
                      content: 'book title',
                    },
                  },
                },
                Contributor: [
                  {
                    PersonName: {
                      content: 'book author',
                    },
                  },
                ],
              },
            },
          },
        ]

        fetchMock.get('https://api.openbd.jp/v1/get?isbn=9783161484100', {
          status: 200,
          body: JSON.stringify(autofillSource),
        })

        setMockState(null)
        renderIt('barcode9783161484100')
        const button = screen.getByLabelText('autofill-button')

        await user.click(button)

        const nameField = screen.getByLabelText('name').querySelector('input')
        const descriptionField = screen
          .getByLabelText('description')
          .querySelector('input')

        await waitFor(() =>
          expect(nameField.value).toEqual('book title book author')
        )
      })
    })
  })
})
