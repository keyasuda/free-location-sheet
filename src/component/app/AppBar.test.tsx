import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import { Provider } from 'react-redux'
import * as ReactRedux from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { store, history } from '../../state/store'
import AppBar from './AppBar'
import CodeReader from './CodeReader'

let codeReaderOnRead
const MockCodeReader = (props) => {
  const { onRead } = props
  codeReaderOnRead = onRead

  return <>code reader</>
}

jest.mock('./CodeReader', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const renderIt = (query) => {
  jest.spyOn(ReactRedux, 'useSelector').mockImplementation((selector) =>
    selector({
      router: {
        location: {
          query,
          pathname: '/app/file-id/',
        },
      },
    })
  )

  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <AppBar />
      </ConnectedRouter>
    </Provider>
  )
}

describe('AppBar', () => {
  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    renderIt({})
  })

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
    })

    it('will be navigated to belongings with keywords when the search button has clicked', async () => {
      const keyword = '検索語'
      const textField = screen.getByLabelText('search-word')
      fireEvent.change(textField, { target: { value: keyword } })
      await userEvent.type(textField, '{enter}')

      expect(push).toHaveBeenCalledWith(
        '/app/file-id/belongings?keyword=' + encodeURIComponent(keyword)
      )
    })

    it('wont navigate to belongings when the keyword is blank', async () => {
      const textField = screen.getByLabelText('search-word')
      fireEvent.change(textField, { target: { value: '' } })
      await userEvent.type(textField, '{enter}')

      expect(push).not.toHaveBeenCalled()
    })
  })

  describe('code reader search', () => {
    const code = JSON.stringify({
      klass: 'belonging',
      id: 'belonginguuid',
    })

    beforeEach(() => {
      const button = screen.getByLabelText('scan')
      userEvent.click(button)
    })

    describe('code is of belonging', () => {
      it('should navigate to belonging page', () => {
        codeReaderOnRead(code)
        expect(history.push).toHaveBeenCalledWith(
          '/app/file-id/belongings/belonginguuid'
        )
      })
    })

    describe('code is of storage', () => {
      const code = JSON.stringify({
        klass: 'storage',
        id: 'storageuuid',
      })

      it('should navigate to storage page', () => {
        codeReaderOnRead(code)
        expect(history.push).toHaveBeenCalledWith(
          '/app/file-id/storages/storageuuid'
        )
      })
    })

    describe('code is unknown', () => {
      const codes = ['generalpurposebarcode', '1234567890']
      codes.map((code) => {
        it('should navigate to belonging page, code as ID', () => {
          codeReaderOnRead(code)
          expect(history.push).toHaveBeenCalledWith(
            `/app/file-id/belongings/${code}`
          )
        })
      })
    })
  })
})
