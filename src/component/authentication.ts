const { gapi } = window;

import { apiKey, clientId } from '../credentials'

import authorizedResource from '../api/authorizedResource'

export const initAuth = async (setState) => {
  await new Promise((resolve,reject) => {
    gapi.load('client:auth2', resolve);
  })

  await gapi.client.init({
    apiKey,
    clientId,
    discoveryDocs: [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ],
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file"
  })

  gapi.auth2.getAuthInstance().isSignedIn.listen(setState)

  const state = gapi.auth2.getAuthInstance().isSignedIn.get()
  setState(state)

  return state
}

export const signIn = () => gapi.auth2.getAuthInstance().signIn()
export const signOut = () => gapi.auth2.getAuthInstance().signOut()
export const authorizedClient = () => authorizedResource(gapi.auth2.getAuthInstance().currentUser.get())
export const authorizedSheet = () => gapi.client.sheets
