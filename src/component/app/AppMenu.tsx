import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'

import CodeReader from './CodeReader'

const AppMenu = (props) => {
  const { fileId } = useParams()
  const history = useHistory()
  const keywordRef = useRef()

  const basePath = `/app/${fileId}`

  const search = () => {
    const w = keywordRef.current.value
    if (w && w.length > 0) {
      history.push(`${basePath}/belongings?keyword=${encodeURIComponent(w)}`)
    }
  }

  const onCodeRead = (code) => {
    try {
      const payload = JSON.parse(code)

      if (payload.klass == 'belonging') {
        history.push('./belongings/' + payload.id)
      } else {
        history.push('./storages/' + payload.id)
      }
    } catch (e) {
      history.push('./belongings/' + code)
    }
  }

  return (
    <div>
      <Link to={`${basePath}/belongings`}>物品一覧</Link>
      <Link to={`${basePath}/storages`}>保管場所一覧</Link>
      <div>
        <TextField id="search-word" label="キーワード" inputRef={keywordRef} />
        <IconButton color="primary" aria-label="search" onClick={search}>
          <SearchIcon />
        </IconButton>
      </div>
      <div>
        <CodeReader onRead={onCodeRead} />
      </div>
    </div>
  )
}
export default AppMenu
