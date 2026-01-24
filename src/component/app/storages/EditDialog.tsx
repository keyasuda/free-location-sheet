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

const EditDialog = (props) => {
  const { item, open, classes, handleClose, update } = props
  const nameRef = useRef()
  const descriptionRef = useRef()
  const [printed, setPrinted] = useState(item.printed)

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
    >
      <DialogTitle>保管場所の編集</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <TextField
            aria-label="name"
            label="名称"
            inputRef={nameRef}
            defaultValue={item.name}
            className={classes.input}
            margin="normal"
          />
          <TextField
            aria-label="description"
            label="説明"
            inputRef={descriptionRef}
            defaultValue={item.description}
            className={classes.input}
            margin="normal"
          />
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
        <IconButton onClick={handleClose}>
          <Icon>close</Icon>
        </IconButton>
        <IconButton
          onClick={() => {
            update({
              ...item,
              name: nameRef.current.value,
              description: descriptionRef.current.value,
              printed: printed,
            })
            handleClose()
          }}
          color="primary"
          aria-label="update"
          autoFocus
        >
          <Icon>done</Icon>
        </IconButton>
      </DialogActions>
    </Dialog>
  )
}
export default EditDialog
