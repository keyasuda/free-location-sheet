import React from 'react'

const Loader = (props) => {
  const { loading, children } = props

  return (
    <>
      { loading && <div>loading...</div> }
      { !loading && children }
    </>
  )
}
export default Loader
