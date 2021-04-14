import React from 'react';
import ReactDOM from 'react-dom';

import App from './app'
import SignInButton from './component/SignInButton'

const IndexApp = () => {
  return (
    <div>
      <SignInButton afterSignedIn={ () => { console.log('hogehoge') } }>
        <div>signed in</div>
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
