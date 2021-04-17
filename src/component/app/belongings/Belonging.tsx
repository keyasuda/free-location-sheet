import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'
import Loader from '../Loader'

const Belonging = (props) => {
  const { fileId, itemId } = useParams()
  const dispatch = useDispatch()
  const keyword = useSelector(s => s.router.location.query.keyword)
  const pending = useSelector(s => s.belongings.pending)
  const item = useSelector(s => s.belongings.list[0])

  useEffect(() => {
    Sheet.init(fileId, authorizedClient(), authorizedSheet())
    dispatch(belongingsAsyncThunk.get(itemId))
  }, [])

  return (
    <Loader loading={ pending }>
      {
        item &&
        <div>
          <h1>{ item.name }</h1>
          <p>{ item.description }</p>
        </div>
      }
    </Loader>
  )
}
export default Belonging
