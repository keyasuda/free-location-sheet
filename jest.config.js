// jest.config.js
const { defaults } = require('jest-config')
module.exports = {
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!(google-auth-library|googleapis|googleapis-common|uuid|gaxios|gcp-metadata|google-gax|proto3-json-serializer|duplexify|google-p12-pem|jws|ms|arrify|retry-request|extend|is-stream|node-fetch|whatwg-url|url-template|google-p12-pem|p-limit|p-queue|abort-controller|stream-events|teeny-request|@babel/runtime|@google-cloud/promisify|@google-cloud/projectify|@google-cloud/resolve-extensions)/)'
  ]
}
