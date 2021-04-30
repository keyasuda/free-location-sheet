import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DoneIcon from '@material-ui/icons/Done'
import ClearIcon from '@material-ui/icons/Clear'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'
import CodeReader from '../CodeReader'

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />

const Storage = (props) => {
  const { id } = props
  const item = useSelector((s) => s.storages.list[0])
  const pending = useSelector((s) => s.storages.pending)
  const dispatch = useDispatch()

  useEffect(() => {
    if (id) {
      dispatch(storagesAsyncThunk.get(id))
    }
  }, [id])

  return (
    <Loader loading={pending}>
      {id && item && <div>{item.name}</div>}
      {(!id || !item) && <div>(not associated with any storages)</div>}
    </Loader>
  )
}

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
  const nameRef = useRef()
  const descriptionRef = useRef()
  const storageIdRef = useRef()
  const [alertOpen, setAlertOpen] = useState(false)

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.get(itemId))
  }, [])

  const add = async () => {
    const addedItem = {
      ...item,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
    }
    await dispatch(belongingsAsyncThunk.add([addedItem]))
  }

  const update = () => {
    const updatedItem = {
      ...item,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
    }

    dispatch(belongingsAsyncThunk.update([updatedItem]))
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
        setStorageId(payload.id)
        closeFunc()
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
    <Loader loading={pending}>
      <div>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
      </div>

      <Storage id={item.storageId} />
      <IconButton aria-label="clear" onClick={() => setStorageId(null)}>
        <ClearIcon />
      </IconButton>

      <div>
        <TextField
          aria-label="name"
          label="名称"
          inputRef={nameRef}
          defaultValue={item.name}
        />
        <TextField
          aria-label="description"
          label="説明"
          inputRef={descriptionRef}
          defaultValue={item.description}
        />

        {!notFound && (
          <IconButton aria-label="update" onClick={update}>
            <DoneIcon />
          </IconButton>
        )}
        {notFound && (
          <IconButton aria-label="add" onClick={add}>
            <DoneIcon />
          </IconButton>
        )}
      </div>

      <div>
        storage update
        <CodeReader onRead={onCodeRead} />
        <Snackbar open={alertOpen} autoHideDuration={6000} onClose={alertClose}>
          <Alert onClose={alertClose} severity="warning">
            not a storage!
          </Alert>
        </Snackbar>
      </div>
    </Loader>
  )
}
export default Belonging
