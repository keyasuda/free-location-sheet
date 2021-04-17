import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'

const Storage = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const pending = useSelector(s => s.storages.pending)
  const item = useSelector(s => s.storages.list[0])

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.get(itemId))
  }, [])

  return (
    <Loader loading={ pending }>
      {
        item &&
        <div>
          <h1>{ item.name }</h1>
          <p>{ item.description }</p>
        </div>
      }
    </Loader>
  )
}
export default Storage
