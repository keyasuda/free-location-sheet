import React, { useEffect, useState, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { makeStyles } from '@material-ui/styles'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import CancelIcon from '@material-ui/icons/Cancel'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

const reader = new BrowserMultiFormatReader()
const COOKIE_NAME = 'PREVIOUS_DEVICE_ID'

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />

const Reader = (props: Props) => {
  const { onRead, deviceId, close, className } = props
  const videoRef = useRef()

  let previous
  useEffect(() => {
    reader.reset()

    if (deviceId) {
      reader.decodeFromVideoDevice(deviceId, videoRef.current, (r, e) => {
        if (r) {
          const read = r.text
          if (read != previous) {
            window.navigator.vibrate(500)
            previous = read
            onRead(read)
          }
        }
      })
    }

    return () => {
      reader.reset()
      previous = null
    }
  }, [deviceId])

  return (
    <video
      ref={videoRef}
      onCanPlay={() => {
        videoRef.current.play()
      }}
      autoPlay
      playsInline
      muted
      className={className}
    />
  )
}

const CodeReader = (props: Props) => {
  const { onRead, closeFunc } = props
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [alert, setAlert] = useState(false)
  const deviceRef = useRef()

  const classes = makeStyles({
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'white',
      zIndex: 1,
    },
    video: {
      margin: 'auto',
      width: '100vw',
      maxHeight: 'calc(100vh - 32px)',
    },
    closeButton: {
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
  })()

  const selectDevice = (device) => {
    setSelectedDevice(device)
    cookieStore.set(COOKIE_NAME, device)
  }

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
    } else {
      setAlert(true)
    }
  }, [])

  return (
    <>
      <Snackbar
        open={alert}
        autoHideDuration={6000}
        onClose={() => {
          setAlert(false)
          closeFunc()
        }}
      >
        <Alert severity="error">カメラがありません</Alert>
      </Snackbar>
      {devices.length > 0 && (
        <div className={classes.container}>
          <IconButton aria-label="close" onClick={closeFunc}>
            <CancelIcon />
          </IconButton>
          <Select
            aria-label="camera selector"
            value={selectedDevice}
            onChange={(e) => selectDevice(e.target.value)}
          >
            {devices.map((d) => (
              <MenuItem value={d.deviceId} key={d.deviceId}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
          <Reader
            onRead={onRead}
            deviceId={selectedDevice}
            close={() => setScanning(false)}
            className={classes.video}
          />
        </div>
      )}
    </>
  )
}

export default CodeReader
