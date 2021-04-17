import React, { useEffect, useState, useRef } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { initAuth, signIn, authorizedClient, authorizedSheet } from '../../authentication'
import { Sheet } from '../../../api/sheet'
import { belongingsAsyncThunk } from '../../../state/belongingsSlice'

const Belongings = (props) => {
  const { fileId } = useParams()
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const dispatch = useDispatch()
  const keyword = useSelector(s => s.router.location.query.keyword)
  const pending = useSelector(s => s.belongings.pending)
  const list = useSelector(s => s.belongings.list)
  const currentPath = useSelector(s => s.router.location.pathname)

  useEffect(async () => {
    const isSignedIn = await initAuth((s) => {
      setLoaded(true)
      setSignedIn(s)
    })

    if (isSignedIn) {
      Sheet.init(fileId, authorizedClient(), authorizedSheet())
      dispatch(belongingsAsyncThunk.search((keyword || '')))
    }
  }, [])

  return (
    loaded &&
    <div>
      {
        pending && <div>loading...</div>
      }
      {
        !pending &&
        <ul>
          {
            (list || []).map((b) => (
              <li key={ b.id }>
                <Link to={ `${currentPath}/${b.id}` }>{ b.name }</Link>
              </li>
            ))
          }
        </ul>
      }
    </div>
  )
}
export default Belongings
