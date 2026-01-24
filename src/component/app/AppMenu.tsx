import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { makeStyles } from '@mui/styles'
import Icon from '@mui/material/Icon'

import AppBar from './AppBar'
import CodeReader from './CodeReader'
import { signOut } from '../authentication'

const AppMenu = (props) => {
  const { fileId } = useParams()
  const navigate = useNavigate()

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
          onClick={() => navigate(`${basePath}/belongings`)}
        >
          <Icon>inventory</Icon>
          物品一覧
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => navigate(`${basePath}/storages`)}
        >
          <Icon>place</Icon>
          保管場所一覧
        </Button>

        <Button
          className={classes.menuItem}
          variant="outlined"
          onClick={() => navigate(`${basePath}/print`)}
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
