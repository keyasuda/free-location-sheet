import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import _ from 'lodash'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import Loader from '../Loader'
import AppBar from '../AppBar'

const newItem = {
  klass: 'belonging',
  name: '',
  description: '',
  storageId: null,
  quantities: 1,
  printed: false,
}

const Belongings = (props) => {
  const { fileId } = useParams()
  const dispatch = useDispatch()
  const keyword = useSelector((s) => {
    const k = s.router.location.query.keyword
    if (k) {
      return decodeURIComponent(k)
    } else {
      return ''
    }
  })
  const pending = useSelector((s) => s.belongings.pending)
  const list = useSelector((s) => s.belongings.list)
  const currentPath = useSelector((s) => s.router.location.pathname)
  const bulkAmountRef = useRef()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.search(keyword || ''))
  }, [keyword])

  const add = () => {
    dispatch(belongingsAsyncThunk.add([newItem]))
  }

  const bulkAdd = () => {
    const amount = Number(bulkAmountRef.current.value)

    if (amount && amount > 0) {
      const items = _.times(amount, () => newItem)
      dispatch(belongingsAsyncThunk.add(items))
    }
  }

  return (
    <>
      <AppBar />
      <Loader loading={pending}>
        <ul>
          {(list || []).map((b) => (
            <li key={b.id}>
              <Link to={`${currentPath}/${b.id}`}>{b.name || '(no name)'}</Link>
            </li>
          ))}
        </ul>
        <div>
          <IconButton aria-label="add" onClick={add}>
            <AddIcon />
          </IconButton>
        </div>
        <div>
          <TextField
            label="数量"
            aria-label="amount"
            inputRef={bulkAmountRef}
          />
          <IconButton aria-label="add bulk" onClick={bulkAdd}>
            <AddIcon />
          </IconButton>
        </div>
      </Loader>
    </>
  )
}
export default Belongings
