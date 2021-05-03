import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useParams, useHistory, Link } from 'react-router-dom'
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
  const list = useSelector((s) => s.storages.list)
  const currentPath = useSelector((s) => s.router.location.pathname)
  const bulkAmountRef = useRef()
  const history = useHistory()
  const keyword = useSearchword()
  const classes = makeListStyles()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(storagesAsyncThunk.search(keyword || ''))
  }, [])

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
      <Loader loading={pending}>
        <List component="nav">
          {(list || []).map((b) => (
            <ListItem key={b.id} button>
              <ListItemText
                primary={b.name || '(名称未設定)'}
                onClick={() => history.push(`${currentPath}/${b.id}`)}
              />
            </ListItem>
          ))}
        </List>
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
      <Dialog open={dialogOpen} onClose={handleClose} disableBackdropClick>
        <DialogTitle>新しい物品を作成</DialogTitle>
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
