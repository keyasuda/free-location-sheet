import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router-dom'

import { store, history } from '../state/store'
import AppMenu from './app/AppMenu'
import Belongings from './app/belongings/Belongings'
import Belonging from './app/belongings/Belonging'
import { initAuth } from './authentication'

const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(async () => {
    const isSignedIn = await initAuth((s) => {
      setLoaded(true)
      setSignedIn(s)
    })
  }, [])

  return (
    loaded &&
    <Provider store={ store }>
      <ConnectedRouter history={ history }>
        <Switch>
          <Route path="/app/:fileId/belongings/:itemId" component={ Belonging } />
          <Route path="/app/:fileId/belongings" component={ Belongings } />
          <Route path="/app/:fileId" component={ AppMenu } />
        </Switch>
      </ConnectedRouter>
    </Provider>
  )
}

export default App;
