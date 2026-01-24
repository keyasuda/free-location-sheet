import React from 'react'
import Button from '@mui/material/Button'
import Icon from '@mui/material/Icon'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const RemoveDialog = (props) => {
  const { open, handleClose, remove } = props

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>物品の削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この物品を削除してよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} aria-label="cancel-remove">
            <Icon>close</Icon>いいえ
          </Button>
          <Button
            onClick={() => {
              remove()
              handleClose()
            }}
            color="primary"
            aria-label="proceed-remove"
          >
            <Icon>done</Icon>はい
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default RemoveDialog
