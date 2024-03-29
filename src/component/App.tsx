import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, Switch } from 'react-router-dom'

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
          <Switch>
            <Route path="/app/:fileId/print" component={PrintQueue} />
            <Route path="/app/:fileId/storages/:itemId" component={Storage} />
            <Route path="/app/:fileId/storages" component={Storages} />
            <Route
              path="/app/:fileId/belongings/:itemId"
              component={Belonging}
            />
            <Route path="/app/:fileId/belongings" component={Belongings} />
            <Route path="/app/:fileId" component={AppMenu} />
          </Switch>
        </Router>
      </Provider>
    </SignInButton>
  )
}

export default App
