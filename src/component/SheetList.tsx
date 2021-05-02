import React, { useEffect, useState } from 'react'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

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
    setSheetList([{ id: newSheetId, name }, ...sheetList])
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
        <List component="nav">
          {sheetList.map((s) => (
            <ListItem key={s.id} button>
              <ListItemText
                primary={s.name}
                onClick={() => (location.href = `/app/${s.id}/`)}
              />
            </ListItem>
          ))}
        </List>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IconButton aria-label="create" onClick={create}>
          <Icon>add_to_drive</Icon>
        </IconButton>
      </div>
    </Loader>
  )
}

export default SheetList
