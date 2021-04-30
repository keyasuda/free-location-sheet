import React, { useEffect, useState, useRef } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { makeStyles } from '@material-ui/styles'

const ItemElement = (props) => {
  const { item } = props
  const codeRef = useRef()
  const writer = new BrowserQRCodeSvgWriter()
  const payload = {
    klass: item.klass,
    id: item.id,
  }

  const classes = makeStyles({
    container: {
      border: '1px solid black',
      boxSizing: 'border-box',
      fontSize: '1.68vh',
      height: '16.49vh',
      textAlign: 'center',
      padding: '0.67vh',
      width: '17.5vh',
    },
    code: {
      '&>svg': {
        height: '6.73vh',
        margin: 'auto',
        width: '6.73vh',
      },
    },
  })()

  useEffect(() => {
    const size = 300
    writer.writeToDom(codeRef.current, JSON.stringify(payload), size, size)
    const svg = codeRef.current.getElementsByTagName('svg')[0]
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
  }, [])

  return (
    <div className={classes.container}>
      <div>
        {item.klass == 'belonging' && <>物品</>}
        {item.klass == 'storage' && <>保管場所</>}
      </div>
      <div className={classes.code} ref={codeRef}></div>
      <div>{item.name}</div>
    </div>
  )
}

const PrintSheet = (props, ref) => {
  const { items } = props
  const classes = makeStyles({
    container: {
      alignContent: 'flex-start',
      display: 'flex',
      flexWrap: 'wrap',
      height: '100vh', // 297mm(A4)
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      pageBreakAfter: 'always',
      width: '70.7vh', // 210mm(A4)
    },
  })()

  return (
    <ul className={classes.container}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemElement item={item} />
        </li>
      ))}
    </ul>
  )
}
export default PrintSheet
