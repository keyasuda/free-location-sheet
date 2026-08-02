const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
const { OAuth2Client } = require('google-auth-library')

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]
const TOKEN_PATH = 'token.json'

const authorize = (credentials) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client)
    const storedToken = JSON.parse(token)
    oAuth2Client.setCredentials(storedToken)

    // Refresh the token if it has expired.
    if (storedToken.expiry_date && storedToken.expiry_date < Date.now()) {
      console.log('The stored token has expired. Refreshing...')
      oAuth2Client.refreshAccessToken((err) => {
        if (err) return getNewToken(oAuth2Client)
        fs.writeFile(
          TOKEN_PATH,
          JSON.stringify(oAuth2Client.credentials),
          (err) => {
            if (err) return console.error(err)
            console.log('Token refreshed and stored to', TOKEN_PATH)
          }
        )
      })
    }
  })
}

const getNewToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
    })
  })
}

const secret = fs.readFileSync('secret.json')
authorize(JSON.parse(secret))
