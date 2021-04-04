/*
unit tests for real api calling
other tests using mocks are at src/api/sheet.test.ts
*/
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

import { Sheet } from '../../src/api/sheet'

const secret = fs.readFileSync('apiTest/api/secret.json')
const { client_secret, client_id, redirect_uris } = JSON.parse(secret).installed
const token = fs.readFileSync('apiTest/api/token.json')
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(JSON.parse(token));

beforeEach(() => {
  Sheet.init('1Dj0TubC0yY_nD80PUAIYezJQOW6XI2WJePcJaXMoViU', oAuth2Client)
})

describe('Sheet', () => {
  describe('common methods', () => {
    const api = Sheet;

    describe('query', () => {
      it('should find rows by ID', async () => {
        // A: ROW, B: ID
        const actual = await api.query('select A where B = "storage-a"', 'storages')
        expect(actual[0]).toEqual([2])
      })
    })
  })

  describe('storages', () => {
    describe('add', () => {

    })

    describe('update', () => {

    })

    describe('delete', () => {

    })
  })

  describe('belongings', () => {
    describe('add', () => {

    })

    describe('update', () => {

    })

    describe('delete', () => {

    })
  })
})
