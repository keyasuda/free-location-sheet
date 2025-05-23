import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'

import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'

import { store, history } from '../../state/store'
import AppBar from './AppBar'
import CodeReader from './CodeReader'

let codeReaderOnRead
const MockCodeReader = (props) => {
  const { onRead } = props
  codeReaderOnRead = onRead

  return <>code reader</>
}

// navigator.mediaDevicesのモック
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: () => {},
          },
        ],
      })
    ),
  },
  writable: true,
})

jest.mock('./CodeReader', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const renderIt = (search) => {
  jest.spyOn(ReactRedux, 'useSelector').mockImplementation((selector) =>
    selector({
      router: {
        location: {
          search,
          pathname: '/app/file-id/',
        },
      },
    })
  )

  let path = '/file-id'
  if (search.length > 0) {
    path = `${path}?${search}`
  }

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]} history={history}>
        <Routes>
          <Route path="/:fileId" element={<AppBar />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate,
}))

describe('AppBar', () => {
  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('keyword search', () => {
    let push
    beforeEach(() => {
      push = jest.spyOn(history, 'push')
      renderIt('')
    })

    it('will be navigated to belongings with keywords when the search button has clicked', async () => {
      const keyword = '検索語'
      const textField = screen.getByLabelText('search-word')
      fireEvent.change(textField, { target: { value: keyword } })
      await userEvent.type(textField, '{enter}')

      expect(mockUseNavigate).toHaveBeenCalledWith(
        '/app/file-id/belongings?keyword=' + encodeURIComponent(keyword)
      )
    })

    it('will navigate to belongings without keywords when the keyword is blank', async () => {
      const textField = screen.getByLabelText('search-word')
      fireEvent.change(textField, { target: { value: '' } })
      await userEvent.type(textField, '{enter}')

      expect(mockUseNavigate).toHaveBeenCalledWith('/app/file-id/belongings')
    })
  })

  describe('search box', () => {
    let push
    beforeEach(() => {
      renderIt('keyword=searchword')
    })

    it('should have clear button with any searchwords', () => {
      screen.getByLabelText('clear search word')
    })

    it('should clean searchword', () => {
      const btn = screen.getByLabelText('clear search word')
      userEvent.click(btn)
      expect(mockUseNavigate).toHaveBeenCalledWith('/app/file-id/belongings')
    })
  })

  describe('code reader search', () => {
    const code = JSON.stringify({
      klass: 'belonging',
      id: 'belonginguuid',
    })

    beforeEach(async () => {
      // async を追加
      renderIt('')
      const button = screen.getByLabelText('scan')
      // クリックイベントを act でラップ
      await act(async () => {
        await userEvent.click(button)
      })
    })

    describe('code is of belonging', () => {
      it('should navigate to belonging page', async () => {
        // async を追加
        await act(async () => {
          codeReaderOnRead(code)
        })
        expect(mockUseNavigate).toHaveBeenCalledWith(
          '/app/file-id/belongings/belonginguuid'
        )
      })
    })

    describe('code is of storage', () => {
      const code = JSON.stringify({
        klass: 'storage',
        id: 'storageuuid',
      })

      it('should navigate to storage page', async () => {
        // async を追加
        await act(async () => {
          codeReaderOnRead(code)
        })
        expect(mockUseNavigate).toHaveBeenCalledWith(
          '/app/file-id/storages/storageuuid'
        )
      })
    })

    describe('code is unknown', () => {
      const codes = ['generalpurposebarcode', '1234567890']
      codes.map((code) => {
        it('should navigate to belonging page, code as ID', async () => {
          // async を追加
          await act(async () => {
            codeReaderOnRead(code)
          })
          expect(mockUseNavigate).toHaveBeenCalledWith(
            `/app/file-id/belongings/${code}`
          )
        })
      })
    })
  })
})
