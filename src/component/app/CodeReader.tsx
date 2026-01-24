import React, { useEffect, useState, useRef } from 'react'
import Cookies from 'js-cookie'
import { BrowserMultiFormatReader } from '@zxing/library'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()({
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
})

const CodeReader = (props: Props) => {
  const { onRead, closeFunc } = props
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [alert, setAlert] = useState(false)
  const deviceRef = useRef()

  const { classes } = useStyles()

  const selectDevice = (device) => {
    setSelectedDevice(device)
    Cookies.set(COOKIE_NAME, device)
  }

  useEffect(() => {
    const init = async () => {
      const previousDeviceId = Cookies.get(COOKIE_NAME)
      const devices = await reader.listVideoInputDevices()
      setDevices(devices)

      if (devices.length > 0) {
        if (
          previousDeviceId &&
          devices.map((d) => d.deviceId).some((i) => i == previousDeviceId)
        ) {
          setSelectedDevice(previousDeviceId)
        } else {
          setSelectedDevice(devices[0].deviceId)
        }
      } else {
        setAlert(true)
      }
    }
    init()
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
            <Icon>close</Icon>
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
            className={classes.video}
          />
        </div>
      )}
    </>
  )
}

export default CodeReader
