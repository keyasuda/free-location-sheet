import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useParams, useHistory, Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon'

import AppBar from './AppBar'
import CodeReader from './CodeReader'
import { signOut } from '../authentication'

const AppMenu = (props) => {
  const { fileId } = useParams()
  const history = useHistory()

  const basePath = `/app/${fileId}`
  const classes = makeStyles({
    menu: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 70px)',
      justifyContent: 'space-evenly',
    },
    menuItem: {
      boxSizing: 'border-box',
      flexGrow: 1,
      margin: '20px auto',
      width: 'calc(100vw - 60px)',
    },
  })()

  return (
    <>
      <Helmet>
        <title>メニュー - 持ち物管理表</title>
      </Helmet>
      <AppBar />
      <div className={classes.menu}>
        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => history.push(`${basePath}/belongings`)}
        >
          <Icon>inventory</Icon>
          物品一覧
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => history.push(`${basePath}/storages`)}
        >
          <Icon>place</Icon>
          保管場所一覧
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => history.push(`${basePath}/print`)}
        >
          <Icon>print</Icon>
          コード印刷
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => (location.href = '/')}
        >
          <Icon>swap_horiz</Icon>
          スプレッドシート変更
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() =>
            window.open(`https://docs.google.com/spreadsheets/d/${fileId}/edit`)
          }
        >
          <Icon>border_all</Icon>
          スプレッドシートを開く
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => {
            signOut()
            location.href = '/'
          }}
        >
          <Icon>logout</Icon>
          ログアウト
        </Button>
      </div>
    </>
  )
}
export default AppMenu
