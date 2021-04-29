const { gapi} = window
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch } from 'react-router-dom'

import App from './component/App'
import SignInButton from './component/SignInButton'
import SheetList from './component/SheetList'

const IndexApp: React.FC = () => {
  return (
    <div>
      <SignInButton>
        <SheetList gapi={ gapi } />
      </SignInButton>
    </div>
  )
}


const root = document.getElementById('index-app')
if (root != null) {
  ReactDOM.render(<IndexApp />, root)
} else {
  const appRoot = document.getElementById('app')
  ReactDOM.render(<App />, appRoot)
}
