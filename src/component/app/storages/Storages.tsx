import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import _ from 'lodash'

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
  const bulkAmountRef = useRef()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.search((keyword || '')))
  }, [])

  const add = () => {
    dispatch(storagesAsyncThunk.add([{
      klass: 'storage',
      name: '',
      description: '',
      printed: false
    }]))
  }

  const bulkAdd = () => {
    const amount = Number(bulkAmountRef.current.value)
    if (amount && amount > 0) {
      const items = _.times(amount, () => ({
        klass: 'storage',
        name: '',
        description: '',
        printed: false
      }))
      dispatch(storagesAsyncThunk.add(items))
    }
  }

  return (
    <Loader loading={ pending }>
      <ul>
        {
          (list || []).map((b) => (
            <li key={ b.id }>
              <Link to={ `${currentPath}/${b.id}` }>{ b.name || '(no name)' }</Link>
            </li>
          ))
        }
      </ul>
      <div>
        <IconButton aria-label="add" onClick={ add }>
          <AddIcon />
        </IconButton>
      </div>
      <div>
        <TextField label="数量" inputRef={ bulkAmountRef } />
        <IconButton aria-label="add" onClick={ bulkAdd }>
          <AddIcon />
        </IconButton>
      </div>
    </Loader>
  )
}
export default Storages
