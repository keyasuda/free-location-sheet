import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CompatRouter } from 'react-router-dom-v5-compat'
import ReactRouter from 'react-router'
import * as ReactRedux from 'react-redux'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import AppMenu from './AppMenu'
import CodeReader from './CodeReader'
import * as auth from '../authentication'

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
  let history, signOut

  beforeEach(() => {
    history = createMemoryHistory({ initialEntries: ['/app/file-id/'] })
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ fileId: 'file-id' })
    jest.spyOn(ReactRouter, 'useHistory').mockReturnValue(history)
    signOut = jest.spyOn(auth, 'signOut').mockReturnValue()

    const mockState = {
      router: {
        location: {
          query: {},
          pathname: '/app/file-id/',
        },
      },
    }

    const mockStore = {
      getState: () => mockState,
      subscribe: jest.fn(),
      dispatch: jest.fn(),
    }

    jest
      .spyOn(ReactRedux, 'useSelector')
      .mockImplementation((selector) => selector(mockState))

    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/app/file-id/']} initialIndex={0}>
          <CompatRouter>
            <AppMenu />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    )
  })

  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('navigation', () => {
    it('should be a menu to let user sign out', () => {
      const button = screen.getByText('ログアウト')
      userEvent.click(button)
      expect(signOut).toHaveBeenCalled()
    })
  })
})
