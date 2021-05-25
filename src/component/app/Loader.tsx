import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'

const Loader = (props) => {
  const { loading, updating, children } = props

  return (
    <>
      {(loading || updating) && <LinearProgress />}
      {!loading && children}
    </>
  )
}
export default Loader
