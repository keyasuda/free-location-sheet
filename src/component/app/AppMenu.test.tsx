import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ReactRouter from 'react-router'
import * as ReactRedux from 'react-redux'
import { Provider } from 'react-redux'
import { createTheme } from '@mui/material/styles'
import { ThemeProvider } from '@mui/styles'
import { createMemoryHistory } from 'history'

const theme = createTheme()
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
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={['/app/file-id']} initialIndex={0}>
            <Routes>
              <Route path="/app/:fileId" element={<AppMenu />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      </ThemeProvider>
    )
  })

  beforeAll(() => {
    CodeReader.mockImplementation(MockCodeReader)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('navigation', () => {
    it('should be a menu to let user sign out', async () => {
      const user = userEvent.setup()
      const button = screen.getByText('ログアウト')
      await user.click(button)
      expect(signOut).toHaveBeenCalled()
    })
  })
})
