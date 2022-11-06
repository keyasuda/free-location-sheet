import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'

import { initAuth, signIn, isSignedIn } from './authentication'
import btnImg from './btn_google_signin_light_normal_web.png'
import btnImg2x from './btn_google_signin_light_normal_web@2x.png'

const SignInButton = (props) => {
  const { styles } = props

  const { afterSignedIn, children } = props

  const [loaded, setLoaded] = useState(false)
  let [signedIn, setSignedIn] = useState(false)

  useEffect(async () => {
    setSignedIn(await initAuth())
    setLoaded(true)

    window.addEventListener('focus', () => setSignedIn(isSignedIn()), false)
  }, [])

  const onClick = async () => {
    await signIn()
    setSignedIn(isSignedIn())

    if (afterSignedIn) {
      afterSignedIn()
    }
  }

  return (
    <div>
      {loaded && !signedIn && (
        <div
          style={{
            ...styles,
            ...{
              display: 'flex',
              justifyContent: 'center',
            },
          }}
        >
          <Button onClick={onClick}>
            <img
              alt="Sign in with Google"
              src={btnImg}
              srcSet={btnImg + ' 1x, ' + btnImg2x + ' 2x'}
            />
          </Button>
        </div>
      )}

      {signedIn && children}
    </div>
  )
}

export default SignInButton
