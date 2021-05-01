import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Fab from '@material-ui/core/Fab'
import Button from '@material-ui/core/Button'
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
  const [dialogOpen, setDialogOpen] = useState(false)
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
  const history = useHistory()

  const classes = makeStyles({
    link: {
      cursor: 'pointer',
      display: 'block',
      margin: '1em',
      textDecoration: 'none',
    },
    fab: {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
    },
    actions: {
      justifyContent: 'space-between',
    },
  })()

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

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      <AppBar />
      <Loader loading={pending}>
        <List component="nav">
          {(list || []).map((b) => (
            <ListItem key={b.id} button>
              <ListItemText
                primary={b.name || '(no name)'}
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
        <AddIcon />
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
            <AddIcon />
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default Belongings
