import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(async () => {
    await initAuth()
    setSignedIn(isSignedIn())
    setLoaded(true)
  }, [])

  return (
    <SignInButton styles={{ marginTop: 'calc(50vh - 29px)' }}>
      <Provider store={store}>
        <Router history={history}>
          <Routes>
            <Route path="/app/:fileId/print" element={<PrintQueue />} />
            <Route path="/app/:fileId/storages/:itemId" element={<Storage />} />
            <Route path="/app/:fileId/storages" element={<Storages />} />
            <Route
              path="/app/:fileId/belongings/:itemId"
              element={<Belonging />}
            />
            <Route path="/app/:fileId/belongings" element={<Belongings />} />
            <Route path="/app/:fileId/" element={<AppMenu />} />
          </Routes>
        </Router>
      </Provider>
    </SignInButton>
  )
}

export default App
