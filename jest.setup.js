const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream } = require('node:stream/web')
const { default: fetch, Headers, Request, Response } = require('node-fetch')

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  ReadableStream,
  fetch,
  Headers,
  Request,
  Response,
})
