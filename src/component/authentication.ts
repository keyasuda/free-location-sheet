const { gapi, google } = window

import { apiKey, clientId } from '../credentials'

import authorizedResource from '../api/authorizedResource'
import Cookies from 'js-cookie'

const COOKIE_NAME = 'wms-session'
Cookies.set('G_AUTH2_MIGRATION', 'enforced')

const getSession = () => JSON.parse(Cookies.get(COOKIE_NAME) || '{}')

export const isSignedIn = () => getSession()['token'] != null

export const initAuth = async () => {
  const session = getSession()
  await new Promise((resolve, reject) => {
    gapi.load('client', { callback: resolve, onerror: reject })
  })

  await gapi.client.init({
    apiKey: apiKey,
    discoveryDocs: [
      'https://sheets.googleapis.com/$discovery/rest?version=v4',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    ],
  })

  if (session['token']) gapi.client.setToken(session['token'])
  return isSignedIn()
}

const authenticate = () => {
  let tokenClient
  const promise = new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (t) => {
        const session = getSession()
        session['token'] = t

        Cookies.set(COOKIE_NAME, JSON.stringify(session), {
          expires: t['expires_in'] / 86400,
        })
        resolve(t)
      },
    })
  })

  tokenClient.requestAccessToken({ prompt: '' })

  return promise
}

export const signIn = async () => await authenticate()
export const signOut = () => {
  const session = getSession()
  session['token'] = null
  Cookies.set(COOKIE_NAME, JSON.stringify(session))
}
export const authorizedClient = () =>
  authorizedResource(() => getSession()['token'])
export const authorizedSheet = () => gapi.client.sheets
