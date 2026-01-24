import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@mui/styles'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import makeCardStyles from '../hooks/makeCardStyles'
import Loader from '../Loader'
import AppBar from '../AppBar'
import Card from './Card'
import EditDialog from './EditDialog'

const Storage = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const pending = useSelector((s) => s.storages.pending)
  const updating = useSelector((s) => s.storages.updating)
  const item = useSelector((s) => s.storages.list[0])
  const [dialogOpen, setDialogOpen] = useState(false)

  const classes = makeCardStyles()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.get(itemId))
  }, [itemId])

  return (
    <>
      <AppBar />
      <Loader loading={pending} updating={updating}>
        {item && (
          <>
            <Card
              item={item}
              classes={classes}
              edit={() => {
                setDialogOpen(true)
              }}
            />
            <EditDialog
              item={item}
              classes={classes}
              update={(i) => dispatch(storagesAsyncThunk.update([i]))}
              open={dialogOpen}
              handleClose={() => setDialogOpen(false)}
            />
          </>
        )}
      </Loader>
    </>
  )
}
export default Storage
