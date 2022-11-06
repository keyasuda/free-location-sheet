import React, { useEffect, useState } from 'react'
import Icon from '@mui/material/Icon'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import { authorizedClient, authorizedSheet } from './authentication'
import { Sheet } from '../api/sheet'
import Loader from './app/Loader'

const SheetList = (props) => {
  const { gapi } = props
  const [loading, setLoading] = useState(false)
  const [sheetList, setSheetList] = useState(null)

  const create = async () => {
    setLoading(true)
    const name = '持ち物管理表'
    const newSheetId = await Sheet.create(name)
    setSheetList([{ id: newSheetId, name }, ...sheetList])
    setLoading(false)
  }

  useEffect(async () => {
    setLoading(true)
    Sheet.init(null, authorizedClient(), authorizedSheet())

    const list = (
      await gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button aria-label="create" onClick={create}>
          <Icon>add_to_drive</Icon>
          新しいスプレッドシートを作成
        </Button>
      </div>
    </Loader>
  )
}

export default SheetList
