import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'

const Loader = (props) => {
  const { loading, children } = props

  return (
    <>
      {loading && <LinearProgress />}
      {!loading && children}
    </>
  )
}
export default Loader
