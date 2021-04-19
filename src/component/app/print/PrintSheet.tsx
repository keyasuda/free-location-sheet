import React, { useEffect, useState, useRef } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'

const ItemElement = (props) => {
  const { item } = props
  const codeRef = useRef()
  const writer = new BrowserQRCodeSvgWriter()
  const payload = {
    klass: item.klass,
    id: item.id
  }

  useEffect(() => writer.writeToDom(codeRef.current, JSON.stringify(payload), 200, 200), [])

  return (
    <div>
      <div ref={ codeRef }></div>
      { item.name }
    </div>
  )
}

const PrintSheet = React.forwardRef((props, ref) => {
  const { items } = props

  return (
    <ul ref={ ref }>
      { items.map((item) => (
        <li key={ item.id }><ItemElement item={ item } /></li>
      )) }
    </ul>
  )
})
export default PrintSheet
