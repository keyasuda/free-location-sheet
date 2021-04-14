import React from 'react';
import ReactDOM from 'react-dom';

import App from './app'
import SignInButton from './component/SignInButton'

const App = () => {
  return (
    <div>
      <SignInButton afterSignedIn={ () => { console.log('hogehoge') } }>
        <div>signed in</div>
      </SignInButton>
    </div>
  )
}


export default App;

const root = document.getElementById('app')
ReactDOM.render(<App />, root)
