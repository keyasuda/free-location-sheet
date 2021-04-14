import React from 'react'
import { render, screen, TestingLibraryElementError } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as authModule from './authentication'
import SignInButton from './SignInButton'

describe('SignInButton', () => {
  let afterSignedIn, initAuth, signIn


  beforeEach(() => {
    afterSignedIn = jest.fn()
    initAuth = jest.spyOn(authModule, 'initAuth')
    signIn = jest.spyOn(authModule, 'signIn')
    signIn.mockResolvedValue()
  })

  const renderIt = () => {
    render(
      <SignInButton afterSignedIn={ afterSignedIn }>
        <div>children</div>
      </SignInButton>
    )
  }

  describe('signed out', () => {
    it('should display "Sign in with Google" button', () => {
      initAuth.mockImplementationOnce((setState) => setState(false))
      renderIt()

      screen.getByRole('button')
      screen.getByAltText('Sign in with Google')
    })

    it('should kick signIn() when the buttton has clicked', async () => {
      initAuth.mockImplementationOnce((setState) => setState(false))
      renderIt()
      await userEvent.type(screen.getByRole('button'), 'JavaScript')

      expect(signIn).toHaveBeenCalled()
    })
  })

  describe('signed in', () => {
    it('should display children content', () => {
      initAuth.mockImplementationOnce((setState) => setState(true))
      renderIt()

      screen.getByText('children')
      expect(
        () => { screen.getByRole('button')}
      ).toThrow(TestingLibraryElementError)
    })
  })
})
