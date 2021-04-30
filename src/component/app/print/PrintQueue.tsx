import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactToPrint from 'react-to-print'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/styles'
import { useReactToPrint } from 'react-to-print'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import PrintSheet from './PrintSheet'

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

  const classes = makeStyles({})()

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

  return (
    <div>
      <Button size="small" color="primary" onClick={print}>
        印刷
      </Button>
      <Button size="small" onClick={updateAsPrinted}>
        印刷済みにする
      </Button>

      <Sheets items={items} ref={sheetRef} />
    </div>
  )
}
export default PrintQueue
