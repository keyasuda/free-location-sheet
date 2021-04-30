import React, { useEffect, useState, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { makeStyles } from '@material-ui/styles'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import CancelIcon from '@material-ui/icons/Cancel'

const reader = new BrowserMultiFormatReader()
const COOKIE_NAME = 'PREVIOUS_DEVICE_ID'

const Reader = (props: Props) => {
  const { onRead, deviceId, close } = props
  const videoRef = useRef()
  const useStyles = makeStyles({
    video: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
    },
    closeButton: {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
  })
  const classes = useStyles()

  useEffect(() => {
    reader.decodeFromVideoDevice(deviceId, videoRef.current, (r, e) => {
      if (r) {
        window.navigator.vibrate(500)
        onRead(r.text, close)
      }
    })
  }, [])

  return (
    <div>
      <video
        ref={videoRef}
        onCanPlay={() => {
          videoRef.current.play()
        }}
        autoPlay
        playsInline
        muted
        className={classes.video}
      />

      <IconButton className={classes.closeButton} onClick={close}>
        <CancelIcon />
      </IconButton>
    </div>
  )
}

const CodeReader = (props: Props) => {
  const { onRead } = props
  const [scanning, setScanning] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const deviceRef = useRef()

  useEffect(async () => {
    const previousDeviceId = await cookieStore.get(COOKIE_NAME)
    const devices = await reader.listVideoInputDevices()
    setDevices(devices)

    if (devices.length > 0) {
      if (
        previousDeviceId &&
        devices.map((d) => d.deviceId).some((i) => i == previousDeviceId.value)
      ) {
        setSelectedDevice(previousDeviceId.value)
      } else {
        setSelectedDevice(devices[0].deviceId)
      }
    }
  }, [])

  const scan = () => {
    cookieStore.set(COOKIE_NAME, selectedDevice)
    setScanning(true)
  }

  return (
    <>
      {devices.length > 0 && (
        <>
          {!scanning && (
            <div>
              {
                <Select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  {devices.map((d) => (
                    <MenuItem value={d.deviceId} key={d.deviceId}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              }
              <IconButton aria-label="scan" onClick={scan}>
                <Icon>qr_code_scanner</Icon>
              </IconButton>
            </div>
          )}
          {scanning && (
            <Reader
              onRead={onRead}
              deviceId={selectedDevice}
              close={() => setScanning(false)}
            />
          )}
        </>
      )}
    </>
  )
}

export default CodeReader
