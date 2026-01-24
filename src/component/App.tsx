import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Routes, Route } from 'react-router-dom'
import { HistoryRouter as Router } from 'redux-first-history/rr6'

import { store, history } from '../state/store'
import AppMenu from './app/AppMenu'
import Belongings from './app/belongings/Belongings'
import Belonging from './app/belongings/Belonging'
import Storages from './app/storages/Storages'
import Storage from './app/storages/Storage'
import PrintQueue from './app/print/PrintQueue'
import AppBar from './app/AppBar'
import SignInButton from './SignInButton'
import { initAuth, isSignedIn } from './authentication'
import {
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'

import theme from '../theme'

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    ;(async () => {
      await initAuth()
      setSignedIn(isSignedIn())
      setLoaded(true)
    })()
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <SignInButton styles={{ marginTop: 'calc(50vh - 29px)' }}>
          <Provider store={store}>
            <Router history={history}>
              <Routes>
                <Route path="/app/:fileId/print" element={<PrintQueue />} />
                <Route
                  path="/app/:fileId/storages/:itemId"
                  element={<Storage />}
                />
                <Route path="/app/:fileId/storages" element={<Storages />} />
                <Route
                  path="/app/:fileId/belongings/:itemId"
                  element={<Belonging />}
                />
                <Route
                  path="/app/:fileId/belongings"
                  element={<Belongings />}
                />
                <Route path="/app/:fileId/" element={<AppMenu />} />
              </Routes>
            </Router>
          </Provider>
        </SignInButton>
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
