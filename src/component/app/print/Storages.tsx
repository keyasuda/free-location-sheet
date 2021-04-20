import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import Button from '@material-ui/core/Button'

import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'

const Storages = (props) => {
  const { add } = props
  const dispatch = useDispatch()
  const items = useSelector(s => s.storages.list)
  const pending = useSelector(s => s.storages.pending)
  const keywordRef = useRef()

  const search = () => {
    const keyword = keywordRef.current.value
    dispatch(storagesAsyncThunk.search(keyword))
  }

  const addAll = () => {
    dispatch(add(items))
  }

  const findNotPrinted = () => {
    dispatch(storagesAsyncThunk.findByPrinted(false))
  }

  return (
    <Loader loading={ pending }>
      <div>
        <h2>保管場所</h2>
        <Button onClick={ findNotPrinted }>未印刷</Button>
        <TextField label="検索語" inputRef={ keywordRef } />
        <IconButton aria-label="update" onClick={ search }>
          <SearchIcon />
        </IconButton>
        <IconButton aria-label="update" onClick={ addAll }>
          <LibraryAddIcon />
        </IconButton>
        <ul>
          { items.map((i) => (
            <li key={ i.id }>
              { i.name }
              <IconButton aria-label="update" onClick={() => { dispatch(add([i])) }}>
                <LibraryAddIcon />
              </IconButton>
            </li>
          )) }
        </ul>
      </div>
    </Loader>
  )
}
export default Storages
