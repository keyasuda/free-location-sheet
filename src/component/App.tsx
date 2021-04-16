import React from 'react';
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router-dom'

import { store, history } from '../state/store'
import AppMenu from './app/AppMenu'

const App: React.FC = () => {
  return (
    <Provider store={ store }>
      <ConnectedRouter history={ history }>
        <Switch>
          <Route path="/app/:fileId" component={ AppMenu } />
        </Switch>
      </ConnectedRouter>
    </Provider>
  )
}

export default App;
