import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import makeCardStyles from '../hooks/makeCardStyles'
import Loader from '../Loader'
import CodeReader from '../CodeReader'
import AppBar from '../AppBar'
import Card from './Card'
import EditDialog from './EditDialog'

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />

const Belonging = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const pending = useSelector((s) => s.belongings.pending)
  const { item, notFound } = useSelector((s) => {
    const inState = s.belongings.list.find((i) => i && i.id == itemId)
    if (inState) {
      return { item: inState, notFound: false }
    } else {
      return {
        item: {
          klass: 'belonging',
          id: itemId,
          name: '',
          description: '',
          printed: true,
          storageId: null,
          quantities: 1,
        },
        notFound: true,
      }
    }
  })
  const history = useHistory()
  const [alertOpen, setAlertOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [openScanner, setOpenScanner] = useState(false)

  const classes = makeCardStyles()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.get(itemId))
  }, [itemId])

  const add = async (item) => {
    await dispatch(belongingsAsyncThunk.add([item]))
  }

  const update = (item) => {
    dispatch(belongingsAsyncThunk.update([item]))
  }

  const setStorageId = (id) => {
    const updatedItem = {
      ...item,
      storageId: id,
    }

    dispatch(belongingsAsyncThunk.update([updatedItem]))
  }

  const onCodeRead = (code, closeFunc) => {
    try {
      const payload = JSON.parse(code)
      if (payload.klass == 'storage') {
        setOpenScanner(false)
        setStorageId(payload.id)
      } else {
        setAlertOpen(true)
      }
    } catch (e) {
      setAlertOpen(true)
    }
  }

  const alertClose = (_, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setAlertOpen(false)
  }

  return (
    <>
      <AppBar />

      <Loader loading={pending}>
        <Card
          item={item}
          fileId={fileId}
          classes={classes}
          scan={() => setOpenScanner(true)}
          edit={() => setDialogOpen(true)}
          update={update}
        />
        <EditDialog
          item={item}
          classes={classes}
          fileId={fileId}
          history={history}
          add={add}
          update={update}
          open={dialogOpen || notFound}
          handleClose={() => setDialogOpen(false)}
          newItem={notFound}
        />
        {openScanner && (
          <CodeReader
            onRead={onCodeRead}
            closeFunc={() => setOpenScanner(false)}
          />
        )}
        <Snackbar open={alertOpen} autoHideDuration={6000} onClose={alertClose}>
          <Alert onClose={alertClose} severity="warning">
            保管場所のコードを読み取って下さい
          </Alert>
        </Snackbar>
      </Loader>
    </>
  )
}
export default Belonging
