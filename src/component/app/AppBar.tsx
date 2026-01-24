import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { alpha } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { default as MUIAppBar } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import InputBase from '@mui/material/InputBase'
import Icon from '@mui/material/Icon'
import IconButton from '@mui/material/IconButton'

import CodeReader from './CodeReader'

import useSearchword from './hooks/useSearchword'

const useStyles = makeStyles((theme) => ({
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
}))

const AppBar = (props) => {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [openScanner, setOpenScanner] = useState(false)
  const keyword = useSearchword()
  const keywordRef = useRef()

  const basePath = `/app/${fileId}`

  const classes = useStyles()

  const search = (w) => {
    if (w && w.length > 0) {
      navigate(`${basePath}/belongings?keyword=${encodeURIComponent(w)}`)
    } else {
      navigate(`${basePath}/belongings`)
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

    if (location.pathname != destination) {
      navigate(destination)
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
            onClick={() => navigate(basePath)}
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
                if (e.key === 'Enter') {
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
