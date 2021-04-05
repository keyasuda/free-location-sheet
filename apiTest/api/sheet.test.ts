/*
unit tests for real api calling
other tests using mocks are at src/api/sheet.test.ts
*/
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

import { Sheet } from '../../src/api/sheet'

const documentId = '1Dj0TubC0yY_nD80PUAIYezJQOW6XI2WJePcJaXMoViU'
const secret = fs.readFileSync('apiTest/api/secret.json')
const { client_secret, client_id, redirect_uris } = JSON.parse(secret).installed
const token = fs.readFileSync('apiTest/api/token.json')
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(JSON.parse(token));
const sheetsService = google.sheets({version: 'v4', auth: oAuth2Client})

beforeEach(() => {
  Sheet.init(documentId, oAuth2Client, sheetsService)
})

describe('Sheet', () => {
  const api = Sheet;

  describe('cell manipulations', () => {

    beforeEach(async () => {
      // overwrite fixtures into the sheet
      const fixtures = [
        ["row", "id", "name", "description", "printed"],
        ["=ROW()", "storage-a", "storage aaaa", "", "FALSE"],
        ["=ROW()", "storage-b", "storage aaaabbbb", "", "FALSE"],
        ["=ROW()", "storage-c", "storage bbbb", "storage description", "FALSE"],
        ["=ROW()", "storage-d", "storage cccc", "", "FALSE"],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""]
      ]
      await sheetsService.spreadsheets.values.update({
        spreadsheetId: documentId,
        range: 'storages!A1:E9',
        valueInputOption: 'USER_ENTERED',
        resource: {values: fixtures}
      })
    })

    describe('query', () => {
      it('should find rows by ID', async () => {
        // A: ROW, B: ID
        const actual = await api.query('select A where B = "storage-a"', 'storages')
        expect(actual[0]).toEqual([2])
      })
    })

    describe('add', () => {
      it('should add a row at the bottom', async () => {
        const row = ['=ROW()', 'new-item', 'new item', 'text', 'FALSE']
        await api.add('storages!A:A', [row])

        const actual = await api.query('select * where B = "new-item"', 'storages')
        expect(actual[0]).toEqual([6, 'new-item', 'new item', 'text', false])
      })
    })

    describe('update', () => {
      it('should update C4 and D4', async () => {
        const expected = ['updated name', 'updated text']
        await api.update('storages!C4:D4', [expected])

        const actual = await api.query('select C, D where B="storage-c"', 'storages')
        expect(actual[0]).toEqual(expected)
      })
    })
  })

  describe('sheet manipulations', () => {
    describe('sheets', () => {
      it('should return a list of sheet names', async () => {
        const actual = await api.sheets()
        expect(actual).toEqual(['belongings', 'storages'])
      })
    })

    describe('createSheet', () => {
      it('should add a new sheet', async () => {
        await api.createSheet('new sheet')
        const actual = await api.sheets()
        expect(actual[actual.length - 1]).toEqual('new sheet')
      })
    })

    afterEach(async () => {
      // remove added sheet if any
      const meta = await sheetsService.spreadsheets.get({spreadsheetId: documentId})
      if (meta.data.sheets.length > 2) {
        const targets = meta.data.sheets.filter((s) => s.properties.title != 'belongings' && s.properties.title != 'storages')
        const requests = targets.map((s) => {
          return ({
            deleteSheet: {
              sheetId: s.properties.sheetId
            }
          })
        })

        await sheetsService.spreadsheets.batchUpdate({
          spreadsheetId: documentId,
          resource: {
            requests
          }
        })
      }
    })
  })
})
