import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router-dom'
import ReactRouter from 'react-router'
import * as ReactRedux from 'react-redux'

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

    const mockState = {
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
})
