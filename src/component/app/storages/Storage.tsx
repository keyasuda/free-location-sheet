import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DoneIcon from '@material-ui/icons/Done'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'

const Storage = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const pending = useSelector((s) => s.storages.pending)
  const item = useSelector((s) => s.storages.list[0])
  const nameRef = useRef()
  const descriptionRef = useRef()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.get(itemId))
  }, [])

  const update = () => {
    const updatedItem = {
      ...item,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
    }

    dispatch(storagesAsyncThunk.update([updatedItem]))
  }

  return (
    <Loader loading={pending}>
      {item && (
        <>
          <div>
            <h1>{item.name}</h1>
            <p>{item.description}</p>
          </div>
          <div>
            <TextField
              label="名称"
              inputRef={nameRef}
              defaultValue={item.name}
            />
            <TextField
              label="説明"
              inputRef={descriptionRef}
              defaultValue={item.description}
            />
            <IconButton aria-label="update" onClick={update}>
              <DoneIcon />
            </IconButton>
          </div>
        </>
      )}
    </Loader>
  )
}
export default Storage
