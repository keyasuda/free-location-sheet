import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react-hooks'

import * as auth from './authentication'
import { Sheet } from '../api/sheet'
import SheetList from './SheetList'
import AppBar from './app/AppBar'

jest.mock('./app/AppBar', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

describe('SheetList', () => {
  beforeAll(() => {
    AppBar.mockImplementation(() => <></>)
  })

  let resolveList

  const gapi = {
    client: {
      drive: {
        files: {
          list: jest.fn().mockReturnValue(
            new Promise((resolve, reject) => {
              resolveList = (ret) => {
                resolve(ret)
              }
            })
          ),
        },
      },
    },
  }

  const mockFiles = [
    { id: 'doc-1', name: 'doc 1' },
    { id: 'doc-2', name: 'doc 2' },
  ]

  beforeEach(() => {
    jest.spyOn(auth, 'authorizedClient').mockReturnValue(jest.fn())
    jest.spyOn(auth, 'authorizedSheet').mockReturnValue(jest.fn())

    render(<SheetList gapi={gapi} />)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should retrieve list of sheets', () => {
    expect(gapi.client.drive.files.list).toHaveBeenCalledWith({
      fields: 'files(id, name)',
      orderBy: 'modifiedTime desc',
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    })
  })

  // it('should show list of sheets', async () => {
  //   await resolveList({result: {files: mockFiles}})
  //
  //   for(let f of mockFiles) {
  //     const a = await screen.findByText(f.name)
  //     expect(a.href).toEqual(`http://localhost/app/${f.id}/`)
  //   }
  // })
})
