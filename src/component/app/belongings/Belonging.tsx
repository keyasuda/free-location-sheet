import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { initAuth, signIn, authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'

const Belonging = (props) => {
  const { fileId, itemId } = useParams()
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const dispatch = useDispatch()
  const keyword = useSelector(s => s.router.location.query.keyword)
  const pending = useSelector(s => s.belongings.pending)
  const item = useSelector(s => s.belongings.list[0])

  useEffect(async () => {
    const isSignedIn = await initAuth((s) => {
      setLoaded(true)
      setSignedIn(s)
    })

    if (isSignedIn) {
      Sheet.init(fileId, authorizedClient(), authorizedSheet())
      dispatch(belongingsAsyncThunk.get(itemId))
    }
  }, [])

  return (
    loaded &&
    <div>
      {
        pending && <div>loading...</div>
      }
      {
        !pending && item &&
        <div>
          <h1>{ item.name }</h1>
          <p>{ item.description }</p>
        </div>
      }
    </div>
  )
}
export default Belonging
