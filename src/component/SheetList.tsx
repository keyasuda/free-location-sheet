import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'

import { authorizedClient, authorizedSheet } from './authentication'
import { Sheet } from '../api/sheet'
import Loader from './app/Loader'

const SheetList = (props) => {
  const { gapi } = props
  const [loading, setLoading] = useState(false)
  const [sheetList, setSheetList] = useState(null)

  const create = async () => {
    setLoading(true)
    const name = 'free-location-sheet'
    const newSheetId = await Sheet.create(name)
    setSheetList([...sheetList, { id: newSheetId, name }])
    setLoading(false)
  }

  useEffect(async () => {
    setLoading(true)
    Sheet.init(null, authorizedClient(), authorizedSheet())

    const list = (
      await gapi.client.drive.files.list({
        q:
          "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id, name)',
        orderBy: 'modifiedTime desc',
      })
    ).result.files

    setSheetList(list)
    setLoading(false)
  }, [])

  return (
    <Loader loading={loading}>
      {sheetList && (
        <ul>
          {sheetList.map((s) => (
            <li key={s.id}>
              <a href={`./app/${s.id}/`}>{s.name}</a>
            </li>
          ))}
        </ul>
      )}

      <Button aria-label="create" onClick={create}>
        create a sheet
      </Button>
    </Loader>
  )
}

export default SheetList
