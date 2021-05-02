import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactToPrint from 'react-to-print'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/styles'
import { useReactToPrint } from 'react-to-print'
import Fab from '@material-ui/core/Fab'
import PrintIcon from '@material-ui/icons/Print'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import PrintSheet from './PrintSheet'
import AppBar from '../AppBar'

const Sheets = React.forwardRef((props, ref) => {
  const { items } = props

  const size = 24
  const chunks = items.reduce(
    (acc, value, index) =>
      index % size ? acc : [...acc, items.slice(index, index + size)],
    []
  )

  return (
    <div ref={ref}>
      {chunks.map((c, i) => (
        <PrintSheet items={c} key={i} />
      ))}
    </div>
  )
})

const PrintQueue = (props) => {
  const { fileId } = useParams()
  const items = useSelector((s) => {
    const belongings = s.belongings.list
    const storages = s.storages.list
    return [...belongings, ...storages]
  })
  const sheetRef = useRef()
  const print = useReactToPrint({
    content: () => sheetRef.current,
  })
  const dispatch = useDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)

  const classes = makeStyles({
    fab: {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
    },
    actions: {
      justifyContent: 'space-between',
    },
    container: { margin: '10px' },
  })()

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.findByPrinted(false))
    dispatch(storagesAsyncThunk.findByPrinted(false))
  }, [])

  const updateAsPrinted = () => {
    const belongings = items
      .filter((i) => i.klass == 'belonging')
      .map((i) => ({ ...i, printed: true }))
    dispatch(belongingsAsyncThunk.update(belongings))
    const storages = items
      .filter((i) => i.klass == 'storage')
      .map((i) => ({ ...i, printed: true }))
    dispatch(storagesAsyncThunk.update(storages))
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  return (
    <>
      <AppBar />
      <Fab
        className={classes.fab}
        color="primary"
        aria-label="print"
        onClick={() => {
          print()
          setDialogOpen(true)
        }}
      >
        <PrintIcon />
      </Fab>
      <div className={classes.container}>
        <Sheets items={items} ref={sheetRef} />
      </div>

      <Dialog open={dialogOpen} onClose={handleClose} disableBackdropClick>
        <DialogTitle>印刷済みコード</DialogTitle>
        <DialogContent>
          <DialogContentText>
            物品・保管場所を印刷済みとして保存しますか?
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={handleClose}>いいえ</Button>
          <Button
            onClick={() => {
              updateAsPrinted()
              handleClose()
            }}
            color="primary"
            aria-label="mark as printed"
            autoFocus
          >
            はい
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default PrintQueue
