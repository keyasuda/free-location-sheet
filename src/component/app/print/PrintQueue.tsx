import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactToPrint from 'react-to-print'
import Button from '@material-ui/core/Button'
import { useReactToPrint } from 'react-to-print'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { printQueueSlice } from '../../../state/printQueueSlice'
import Belongings from './Belongings'
import Storages from './Storages'
import PrintSheet from './PrintSheet'

const PrintQueue = (props) => {
  const { fileId } = useParams()
  const items = useSelector((s) => s.printQueue.list)
  const sheetRef = useRef()
  const print = useReactToPrint({
    content: () => sheetRef.current
  })

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
  }, [])

  return (
    <>
      <div>
        <h2>印刷対象</h2>
        <ul>
          {
            items.map((i) => (
              <li key={ i.id }>
                { i.name } { i.klass }
              </li>
            ))
          }
        </ul>
      </div>

      <Button size="small" color="primary" onClick={ print }>
        印刷
      </Button>
      <PrintSheet items={ items } ref={ sheetRef } />

      <Belongings add={ printQueueSlice.actions.add } />
      <Storages add={ printQueueSlice.actions.add } />
    </>
  )
}
export default PrintQueue
