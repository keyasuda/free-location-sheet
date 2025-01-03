import React, { useRef, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import DateFnsUtils from '@date-io/date-fns'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import jaLocale from 'date-fns/locale/ja'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'

import { autoFillEndpoint } from '../../../settings'

const OpenBD = 'https://api.openbd.jp/v1/get?isbn='

export class JaDateFnsUtils extends DateFnsUtils {
  getCalendarHeaderText(date: Date) {
    return format(date, 'yyyy MMM', { locale: this.locale })
  }

  getDatePickerHeaderText(date: Date) {
    return format(date, 'MMMd日', { locale: this.locale })
  }
}

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />

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
      const ret = await fetch(autoFillEndpoint + ean)

      if (ret.ok) {
        const src = await ret.json()
        setValue('name', src.name)
        setValue('description', src.url)
      } else {
        setAlert(true)
      }
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
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
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
              <MuiPickersUtilsProvider utils={JaDateFnsUtils} locale={jaLocale}>
                <DatePicker
                  margin="normal"
                  aria-label="deadline"
                  label="期限"
                  okLabel="確定"
                  cancelLabel="キャンセル"
                  format="yyyy/MM/dd"
                  value={deadline}
                  onChange={setDeadline}
                />
              </MuiPickersUtilsProvider>
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
