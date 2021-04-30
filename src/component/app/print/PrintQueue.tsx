import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactToPrint from 'react-to-print'
import Button from '@material-ui/core/Button'
import { useReactToPrint } from 'react-to-print'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import { storagesAsyncThunk } from '../../../state/storagesSlice'
import PrintSheet from './PrintSheet'

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
    <>
      <div>
        <h2>印刷対象</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              {i.name} {i.klass}
            </li>
          ))}
        </ul>
      </div>

      <Button size="small" color="primary" onClick={print}>
        印刷
      </Button>
      <PrintSheet items={items} ref={sheetRef} />

      <Button size="small" onClick={updateAsPrinted}>
        印刷済みにする
      </Button>
    </>
  )
}
export default PrintQueue
