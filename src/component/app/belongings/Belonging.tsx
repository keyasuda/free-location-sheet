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
import RemoveDialog from './RemoveDialog'

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />

const Belonging = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()

  const pending = useSelector((s) => s.belongings.pending)
  const updating = useSelector((s) => s.belongings.updating)
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
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
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

  const remove = (item) => {
    dispatch(belongingsAsyncThunk.remove(item))
    history.push(`/app/${fileId}/belongings`)
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

  const onEditFormSubmit = (values) => {
    const payload = {
      ...item,
      name: values.name,
      description: values.description,
      quantities: Number(values.quantities),
      printed: values.printed,
    }
    if (notFound) {
      add(payload)
    } else {
      update(payload)
    }
  }

  const onEditFormCancel = () => {
    if (notFound) history.push(`/app/${fileId}`)
    setDialogOpen(false)
  }

  return (
    <>
      <AppBar />

      <Loader loading={pending} updating={updating}>
        <Card
          item={item}
          fileId={fileId}
          classes={classes}
          scan={() => setOpenScanner(true)}
          edit={() => setDialogOpen(true)}
          update={update}
          removeButtonClick={() => setRemoveDialogOpen(true)}
        />

        <EditDialog
          classes={classes}
          open={dialogOpen || notFound}
          itemId={itemId}
          item={item}
          newItem={notFound}
          onSubmit={onEditFormSubmit}
          onCancel={onEditFormCancel}
          handleClose={() => setDialogOpen(false)}
        />

        <RemoveDialog
          handleClose={() => setRemoveDialogOpen(false)}
          remove={() => remove(item)}
          open={removeDialogOpen}
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
