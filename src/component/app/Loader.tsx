import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'

const Loader = (props) => {
  const { loading, updating, children, header } = props

  return (
    <>
      {(loading || updating) && <LinearProgress />}
      {header}
      {!loading && children}
    </>
  )
}
export default Loader
