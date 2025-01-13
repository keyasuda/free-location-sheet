import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import _ from 'lodash'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import Loader from '../Loader'
import AppBar from '../AppBar'
import makeListStyles from '../hooks/makeListStyles'
import useSearchword from '../hooks/useSearchword'

const Storages = (props) => {
  const { fileId } = useParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const dispatch = useDispatch()
  const pending = useSelector((s) => s.storages.pending)
  const updating = useSelector((s) => s.storages.updating)
  const list = useSelector((s) => s.storages.list)
  const nextPage = useSelector((s) => s.storages.nextPage)
  const page = useSelector((s) => s.storages.page)
  const bulkAmountRef = useRef()
  const keyword = useSearchword()
  const classes = makeListStyles()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.search({ keyword: keyword || '' }))
  }, [])

  const getNextPage = () => {
    dispatch(
      storagesAsyncThunk.searchNext({
        keyword: keyword || '',
        page: page + 1,
      })
    )
  }

  const bulkAdd = () => {
    const amount = Number(bulkAmountRef.current.value)
    if (amount && amount > 0) {
      const items = _.times(amount, () => ({
        klass: 'storage',
        name: '',
        description: '',
        printed: false,
      }))
      dispatch(storagesAsyncThunk.add(items))
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      <Helmet>
        <title>保管場所一覧 - 持ち物管理表</title>
      </Helmet>
      <AppBar />
      <Loader loading={pending} updating={updating}>
        <List component="nav">
          {(list || []).map((b) => (
            <ListItem key={b.id}>
              <div className={classes.linkContainer}>
                <Link to={b.id} className={classes.link}>
                  {b.name || '(名称未設定)'}
                </Link>
              </div>
            </ListItem>
          ))}
        </List>
        {nextPage && (
          <div className={classes.paginator}>
            <IconButton onClick={getNextPage}>
              <Icon>expand_more</Icon>
            </IconButton>
          </div>
        )}
      </Loader>
      <Fab
        className={classes.fab}
        color="primary"
        aria-label="add"
        onClick={() => {
          setDialogOpen(true)
        }}
      >
        <Icon>add</Icon>
      </Fab>
      <Dialog
        open={dialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle>新しい保管場所を作成</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <TextField
              label="数量"
              aria-label="amount"
              inputRef={bulkAmountRef}
              defaultValue={1}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button
            onClick={() => {
              bulkAdd()
              handleClose()
            }}
            color="primary"
            aria-label="add bulk"
            autoFocus
          >
            <Icon>add</Icon>
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default Storages
