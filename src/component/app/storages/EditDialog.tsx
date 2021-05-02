import React, { useRef } from 'react'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const EditDialog = (props) => {
  const { item, open, classes, handleClose, update } = props
  const nameRef = useRef()
  const descriptionRef = useRef()

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>保管場所の編集</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <TextField
            aria-label="name"
            label="名称"
            inputRef={nameRef}
            defaultValue={item.name}
            className={classes.input}
          />
          <TextField
            aria-label="description"
            label="説明"
            inputRef={descriptionRef}
            defaultValue={item.description}
            className={classes.input}
          />
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
