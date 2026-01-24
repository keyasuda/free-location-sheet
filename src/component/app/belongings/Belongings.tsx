import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import {
  useParams,
  useNavigate,
  Link,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TextField from '@mui/material/TextField'
import Icon from '@mui/material/Icon'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Fab from '@mui/material/Fab'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import _ from 'lodash'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import Loader from '../Loader'
import AppBar from '../AppBar'
import makeListStyles from '../hooks/makeListStyles'
import useSearchword from '../hooks/useSearchword'

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
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const dispatch = useDispatch()
  const pending = useSelector((s) => s.belongings.pending)
  const updating = useSelector((s) => s.belongings.updating)
  const list = useSelector((s) => s.belongings.list)
  const nextPage = useSelector((s) => s.belongings.nextPage)
  const page = useSelector((s) => s.belongings.page)
  const deadline = searchParams.get('deadline') === 'true'
  const bulkAmountRef = useRef()
  const navigate = useNavigate()
  const keyword = useSearchword()
  const classes = makeListStyles()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(
      belongingsAsyncThunk.search({
        keyword: keyword || '',
        page: 0,
        deadline: deadline,
      })
    )
  }, [keyword, deadline, location.search])

  const getNextPage = () => {
    dispatch(
      belongingsAsyncThunk.searchNext({
        keyword: keyword || '',
        page: page + 1,
      })
    )
  }

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

  const onDeadlineChipClick = () => {
    const params = []
    if (keyword) {
      params.push(`keyword=${keyword}`)
    }
    if (!deadline) {
      params.push('deadline=true')
    }
    const q = params.length > 0 ? `?${params.join('&')}` : ''
    navigate(`${location.pathname}${q}`)
  }

  return (
    <>
      <Helmet>
        <title>物品一覧 - 持ち物管理表</title>
      </Helmet>
      <AppBar />
      <Loader
        loading={pending}
        updating={updating}
        header={
          <div className={classes.header}>
            <Chip
              icon={<Icon>event</Icon>}
              aria-label="search-by-deadline"
              label="期限があるもの"
              clickable
              color={deadline ? 'primary' : 'default'}
              onClick={onDeadlineChipClick}
            />
          </div>
        }
      >
        <List component="nav">
          {(list || []).map((b) => (
            <ListItem key={b.id}>
              <div className={classes.linkContainer}>
                <Link to={b.id} className={classes.link}>
                  {b.name || '(名称未設定)'}
                </Link>
                {b.deadline && (
                  <div className={classes.deadline}>{b.deadline}</div>
                )}
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
export default Belongings
