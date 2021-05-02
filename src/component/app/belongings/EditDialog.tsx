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

const EditDialog = (props) => {
  const {
    item,
    open,
    newItem,
    history,
    classes,
    handleClose,
    add,
    update,
    fileId,
  } = props
  const nameRef = useRef()
  const descriptionRef = useRef()
  const quantitiesRef = useRef()
  const [printed, setPrinted] = useState(item.printed)

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {newItem && <>物品の追加</>}
        {!newItem && <>物品の編集</>}
      </DialogTitle>
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
          <TextField
            label="数量"
            aria-label="quantities"
            inputRef={quantitiesRef}
            defaultValue={1}
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
        {newItem && (
          <>
            <IconButton
              onClick={() => history.push(`/app/${fileId}`)}
              aria-label="cancel"
            >
              <Icon>close</Icon>
            </IconButton>
            <IconButton
              onClick={() => {
                add({
                  ...item,
                  name: nameRef.current.value,
                  description: descriptionRef.current.value,
                  quantities: Number(quantitiesRef.current.value),
                  printed: printed,
                })
                handleClose()
              }}
              color="primary"
              aria-label="add"
              autoFocus
            >
              <Icon>done</Icon>
            </IconButton>
          </>
        )}
        {!newItem && (
          <>
            <IconButton onClick={handleClose}>
              <Icon>close</Icon>
            </IconButton>
            <IconButton
              onClick={() => {
                update({
                  ...item,
                  name: nameRef.current.value,
                  description: descriptionRef.current.value,
                  quantities: Number(quantitiesRef.current.value),
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
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
export default EditDialog
