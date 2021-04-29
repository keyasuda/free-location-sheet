import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'

import { initAuth, signIn } from './authentication'
import btnImg from "./btn_google_signin_light_normal_web.png"
import btnImg2x from "./btn_google_signin_light_normal_web@2x.png"

const SignInButton = (props) => {
  const { afterSignedIn, children } = props

  const [loaded, setLoaded] = useState(false)
  let [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    initAuth((s) => {
      setLoaded(true)
      setSignedIn(s)
    })
  }, [])

  const onClick = async () => {
    await signIn()
    if(afterSignedIn) { afterSignedIn() }
  }

  return (
    <div>
      {
        loaded && !signedIn && (
          <Button onClick={ onClick }>
            <img
              alt="Sign in with Google"
              src={ btnImg }
              srcSet={ btnImg + " 1x, " + btnImg2x + " 2x" }
            />
          </Button>
        )
      }

      { signedIn && children }
    </div>
  )
}

export default SignInButton
