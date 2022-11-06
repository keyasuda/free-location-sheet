import React, { useRef, useState } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Icon from '@mui/material/Icon'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import DateFnsUtils from '@date-io/date-fns'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import jaLocale from 'date-fns/locale/ja'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@mui/styles'

import { autoFillEndpoint } from '../../../settings'

const OpenBD = 'https://api.openbd.jp/v1/get?isbn='

const Alert = (props) => (
  <div>
    <MuiAlert elevation={6} variant="filled" {...props} />
  </div>
)

const EditDialog = (props) => {
  const {
    classes,
    open,
    itemId,
    item,
    newItem,
    onSubmit,
    onCancel,
    handleClose,
  } = props

  const nameRef = useRef()
  const descriptionRef = useRef()
  const quantitiesRef = useRef()

  const { control, setValue } = useForm()

  const [printed, setPrinted] = useState(item.printed)
  const [alert, setAlert] = useState(false)
  const [deadline, setDeadline] = useState(item.deadline ? item.deadline : null)

  const clearButtonClass = makeStyles({
    clear: {
      margin: '20px 0 0 0',
    },
  })()

  const autofill = async () => {
    const ean = itemId.replace('barcode', '')

    if (ean.match(/97[89][0-9]{10}/)) {
      const ret = await fetch(OpenBD + ean)

      if (ret.ok) {
        const src = await ret.json()
        const title =
          src[0].onix.DescriptiveDetail.TitleDetail.TitleElement.TitleText
            .content
        const author =
          src[0].onix.DescriptiveDetail.Contributor[0].PersonName.content
        setValue('name', title + ' ' + author)
      } else {
        setAlert(true)
      }
    } else {
      // const ret = await fetch(autoFillEndpoint + ean)
      //
      // if (ret.ok) {
      //   const src = await ret.json()
      //   setValue('name', src.name)
      //   setValue('description', src.url)
      // } else {
      // }
      setAlert(true)
    }
  }

  const submit = () => {
    let deadlineStr = ''
    if (typeof deadline == 'object') {
      deadlineStr = deadline ? format(deadline, 'yyyy/MM/dd') : ''
    } else {
      deadlineStr = format(
        parse(deadline, 'yyyy/MM/dd', new Date()),
        'yyyy/MM/dd'
      )
    }

    onSubmit({
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      quantities: quantitiesRef.current.value,
      printed: printed,
      deadline: deadlineStr,
    })
    handleClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} disableBackdropClick>
        <DialogTitle>
          {newItem && <>物品の追加</>}
          {!newItem && <>物品の編集</>}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Controller
              name="name"
              control={control}
              defaultValue={item.name}
              render={({ field }) => (
                <TextField
                  {...field}
                  aria-label="name"
                  label="名称"
                  inputRef={nameRef}
                  className={classes.input}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              defaultValue={item.description}
              render={({ field }) => (
                <TextField
                  {...field}
                  aria-label="description"
                  label="説明"
                  inputRef={descriptionRef}
                  className={classes.input}
                />
              )}
            />

            <TextField
              label="数量"
              aria-label="quantities"
              inputRef={quantitiesRef}
              defaultValue={item.quantities}
            />

            <div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="期限"
                  value={deadline}
                  onChange={setDeadline}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>

              {deadline && (
                <IconButton
                  onClick={() => setDeadline(null)}
                  className={clearButtonClass.clear}
                >
                  <Icon>clear</Icon>
                </IconButton>
              )}
            </div>

            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={printed}
                    onChange={(e) => setPrinted(e.target.checked)}
                    name="printed"
                    color="primary"
                  />
                }
                label="印刷済み"
              />
            </FormGroup>
          </DialogContentText>
        </DialogContent>

        <DialogActions className={classes.actions}>
          <IconButton onClick={onCancel} aria-label="cancel">
            <Icon>close</Icon>
          </IconButton>

          {newItem && (
            <IconButton aria-label="autofill-button" onClick={autofill}>
              <Icon>auto_fix_normal</Icon>
            </IconButton>
          )}

          <IconButton
            onClick={submit}
            color="primary"
            aria-label="done"
            autoFocus
          >
            <Icon>done</Icon>
          </IconButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alert}
        autoHideDuration={6000}
        onClose={() => {
          setAlert(false)
        }}
      >
        <Alert severity="info">自動入力できませんでした</Alert>
      </Snackbar>
    </>
  )
}
export default EditDialog
