import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'

import AppMenu from './AppMenu'
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

describe('AppMenu', () => {
  let history

  beforeEach(() => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    history = { push: jest.fn() }
    jest.spyOn(ReactRouter, 'useHistory').mockReturnValue(history)
    render(
      <MemoryRouter>
        <AppMenu />
      </MemoryRouter>
    )
  })

  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('navigation', () => {
    it('should have links to lists', () => {
      expect(screen.getByText('物品一覧').href).toEqual(
        'http://localhost/app/file-id/belongings'
      )
      expect(screen.getByText('保管場所一覧').href).toEqual(
        'http://localhost/app/file-id/storages'
      )
    })
  })

  describe('keyword search', () => {
    it('will be navigated to belongings with keywords when the search button has clicked', async () => {
      const keyword = '検索語'
      const textField = screen.getByLabelText('キーワード')
      fireEvent.change(textField, { target: { value: keyword } })
      await userEvent.click(screen.getByLabelText('search'))

      expect(history.push).toHaveBeenCalledWith(
        '/app/file-id/belongings?keyword=' + encodeURIComponent(keyword)
      )
    })

    it('wont navigate to belongings when the keyword is blank', async () => {
      const textField = screen.getByLabelText('キーワード')
      fireEvent.change(textField, { target: { value: '' } })
      await userEvent.click(screen.getByLabelText('search'))

      expect(history.push).not.toHaveBeenCalled()
    })
  })

  describe('code reader search', () => {
    const code = JSON.stringify({
      klass: 'belonging',
      id: 'belonginguuid',
    })

    describe('code is of belonging', () => {
      it('should navigate to belonging page', () => {
        codeReaderOnRead(code)
        expect(history.push).toHaveBeenCalledWith('./belongings/belonginguuid')
      })
    })

    describe('code is of storage', () => {
      const code = JSON.stringify({
        klass: 'storage',
        id: 'storageuuid',
      })

      it('should navigate to storage page', () => {
        codeReaderOnRead(code)
        expect(history.push).toHaveBeenCalledWith('./storages/storageuuid')
      })
    })

    describe('code is unknown', () => {
      const code = 'generalpurposebarcode'

      it('should navigate to belonging page, code as ID', () => {
        codeReaderOnRead(code)
        expect(history.push).toHaveBeenCalledWith('./belongings/' + code)
      })
    })
  })
})
