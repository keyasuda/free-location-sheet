import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fade, makeStyles } from '@material-ui/core/styles'
import { default as MUIAppBar } from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import InputBase from '@material-ui/core/InputBase'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import HomeIcon from '@material-ui/icons/Home'

import CodeReader from './CodeReader'

const AppBar = (props) => {
  const { fileId } = useParams()
  const history = useHistory()
  const basePath = `/app/${fileId}`
  const keyword = useSelector((s) => {
    const k = s.router.location.query.keyword
    if (k) {
      return decodeURIComponent(k)
    } else {
      return ''
    }
  })

  const classes = makeStyles((theme) => ({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
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
  }))()

  const search = (w) => {
    if (w && w.length > 0) {
      history.push(`${basePath}/belongings?keyword=${encodeURIComponent(w)}`)
    }
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
            <HomeIcon />
          </IconButton>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="検索"
              defaultValue={keyword}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search-word' }}
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
            aria-label="home"
            onClick={() => (location.href = '/')}
          >
            <Icon>qr_code_scanner</Icon>
          </IconButton>
        </Toolbar>
      </MUIAppBar>
    </>
  )
}
export default AppBar