import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, Switch } from 'react-router-dom'
import { CompatRouter, CompatRoute } from 'react-router-dom-v5-compat' // ここでCompatRouterをインポート

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
          <CompatRouter>
            <Switch>
              <CompatRoute path="/app/:fileId/print" component={PrintQueue} />
              <CompatRoute
                path="/app/:fileId/storages/:itemId"
                component={Storage}
              />
              <CompatRoute path="/app/:fileId/storages" component={Storages} />
              <CompatRoute
                path="/app/:fileId/belongings/:itemId"
                component={Belonging}
              />
              <CompatRoute
                path="/app/:fileId/belongings"
                component={Belongings}
              />
              <CompatRoute path="/app/:fileId" component={AppMenu} />
            </Switch>
          </CompatRouter>
        </Router>
      </Provider>
    </SignInButton>
  )
}

export default App
