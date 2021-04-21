import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DoneIcon from '@material-ui/icons/Done'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'

const Storage = (props) => {
  const { id } = props
  const item = useSelector(s => s.storages.list[0])
  const pending = useSelector(s => s.storages.pending)
  const dispatch = useDispatch()

  useEffect(() => {
    if (id){
      dispatch(storagesAsyncThunk.get(id))
    }
  }, [id])

  return (
    <Loader loading={ pending }>
      {
        id && item && (
          <div>
            { item.name }
          </div>
        )
      }
      {
        (!id || !item) && <div>(not associated with any storages)</div>
      }
    </Loader>
  )
}

const Belonging = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const pending = useSelector(s => s.belongings.pending)
  const item = useSelector(s => s.belongings.list[0])
  const nameRef = useRef()
  const descriptionRef = useRef()
  const storageIdRef = useRef()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.get(itemId))
  }, [])

  const update = () => {
    const updatedItem = {
      ...item,
      name: nameRef.current.value,
      description: descriptionRef.current.value
    }

    dispatch(belongingsAsyncThunk.update([updatedItem]))
  }

  const setStorageId = () => {
    const id = storageIdRef.current.value

    const updatedItem = {
      ...item,
      storageId: id
    }

    dispatch(belongingsAsyncThunk.update([updatedItem]))
  }

  return (
    <Loader loading={ pending }>
      {
        item &&
        <>
          <div>
            <h1>{ item.name }</h1>
            <p>{ item.description }</p>
          </div>

          <Storage id={ item.storageId } />

          <div>
            <TextField
              aria-label="name"
              label="名称"
              inputRef={ nameRef }
              defaultValue={ item.name } />
            <TextField
              aria-label="description"
              label="説明"
              inputRef={ descriptionRef }
              defaultValue={ item.description } />
            <IconButton aria-label="update" onClick={ update }>
              <DoneIcon />
            </IconButton>
          </div>

          <div>
            <TextField
              aria-label="storage-id"
              label="storage ID"
              inputRef={ storageIdRef }
              defaultValue={ item.storageId } />
            <IconButton aria-label="set-storage-id" onClick={ setStorageId }>
              <DoneIcon />
            </IconButton>
          </div>
        </>
      }
    </Loader>
  )
}
export default Belonging
