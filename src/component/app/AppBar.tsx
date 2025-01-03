import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { alpha, makeStyles } from '@material-ui/core/styles'
import { default as MUIAppBar } from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import InputBase from '@material-ui/core/InputBase'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'

import CodeReader from './CodeReader'

const AppBar = (props) => {
  const { fileId } = useParams()
  const history = useHistory()
  const [openScanner, setOpenScanner] = useState(false)
  const keyword = useSelector((s) => {
    const query = new URLSearchParams(s.router.location.search)
    const k = query.get('keyword')
    if (k) {
      return decodeURIComponent(k)
    } else {
      return ''
    }
  })
  const keywordRef = useRef()

  const basePath = `/app/${fileId}`

  const classes = makeStyles((theme) => ({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginRight: 0,
      marginLeft: 0,
      width: '100%',
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
      width: '100%',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
    },
    clearSearchButton: {
      color: 'white',
      width: '32px',
      height: '32px',
      marginRight: '10px',
    },
  }))()

  const search = (w) => {
    if (w && w.length > 0) {
      history.push(`${basePath}/belongings?keyword=${encodeURIComponent(w)}`)
    } else {
      history.push(`${basePath}/belongings`)
    }
  }

  const onCodeRead = (code) => {
    let destination
    try {
      const payload = JSON.parse(code)

      switch (payload.klass) {
        case 'belonging':
          destination = `${basePath}/belongings/${payload.id}`
          break

        case 'storage':
          destination = `${basePath}/storages/${payload.id}`
          break

        default:
          destination = `${basePath}/belongings/${encodeURIComponent(code)}`
      }
    } catch (e) {
      destination = `${basePath}/belongings/${encodeURIComponent(code)}`
    }

    if (history.location.pathname != destination) {
      history.push(destination)
    }
    setOpenScanner(false)
  }

  return (
    <>
      <MUIAppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            onClick={() => history.push(basePath)}
          >
            <Icon>home</Icon>
          </IconButton>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <Icon>search</Icon>
            </div>
            <InputBase
              placeholder="検索"
              defaultValue={keyword}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              endAdornment={
                keyword.length > 0 && (
                  <IconButton
                    className={classes.clearSearchButton}
                    onClick={() => {
                      keywordRef.current.value = ''
                      search('')
                    }}
                    aria-label="clear search word"
                  >
                    <Icon>backspace</Icon>
                  </IconButton>
                )
              }
              inputProps={{ 'aria-label': 'search-word', ref: keywordRef }}
              onKeyDown={(e) => {
                if (e.keyCode == 13) {
                  search(e.target.value)
                }
              }}
            />
          </div>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="scan"
            onClick={async () => {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
              })
              stream.getTracks().forEach((track) => track.stop())

              setOpenScanner(true)
            }}
          >
            <Icon>qr_code_scanner</Icon>
          </IconButton>
        </Toolbar>
      </MUIAppBar>
      {openScanner && (
        <CodeReader
          onRead={onCodeRead}
          closeFunc={() => setOpenScanner(false)}
        />
      )}
    </>
  )
}
export default AppBar
