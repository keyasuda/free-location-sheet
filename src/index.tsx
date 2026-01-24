import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import {
  StyledEngineProvider,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'

import theme from './theme'
import App from './component/App'
import SignInButton from './component/SignInButton'
import SheetList from './component/SheetList'

const IndexApp: React.FC = () => {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <SignInButton>
          <SheetList gapi={(window as any).gapi} />
        </SignInButton>
      </MuiThemeProvider>
    </StyledEngineProvider>
  )
}

const rootElement = document.getElementById('index-app')
if (rootElement != null) {
  const root = createRoot(rootElement)
  root.render(<IndexApp />)
} else {
  const appRoot = document.getElementById('app')
  if (appRoot) {
    const root = createRoot(appRoot)
    root.render(<App />)
  }
}
