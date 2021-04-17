import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'

const Storages = (props) => {
  const { fileId } = useParams()
  const dispatch = useDispatch()
  const keyword = useSelector(s => s.router.location.query.keyword)
  const pending = useSelector(s => s.storages.pending)
  const list = useSelector(s => s.storages.list)
  const currentPath = useSelector(s => s.router.location.pathname)

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.search((keyword || '')))
  }, [])

  return (
    <Loader loading={ pending }>
      <ul>
        {
          (list || []).map((b) => (
            <li key={ b.id }>
            <Link to={ `${currentPath}/${b.id}` }>{ b.name }</Link>
            </li>
          ))
        }
      </ul>
    </Loader>
  )
}
export default Storages
