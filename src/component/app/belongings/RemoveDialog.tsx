import React from 'react'
import Button from '@material-ui/core/Button'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

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
