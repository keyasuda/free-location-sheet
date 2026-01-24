import React from 'react'
import LinearProgress from '@mui/material/LinearProgress'

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
