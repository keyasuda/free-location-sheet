const { gapi } = window
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import App from './component/App'
import SignInButton from './component/SignInButton'
import SheetList from './component/SheetList'

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },
  },
})

const IndexApp: React.FC = () => {
  return (
    <SignInButton>
      <SheetList gapi={gapi} />
    </SignInButton>
  )
}

const root = document.getElementById('index-app')
if (root != null) {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <IndexApp />
    </ThemeProvider>,
    root
  )
} else {
  const appRoot = document.getElementById('app')
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>,
    appRoot
  )
}
