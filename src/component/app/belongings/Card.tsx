import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import { default as MuiCard } from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'

import { storagesAsyncThunk } from '../../../state/storagesSlice'

const StorageName = (props) => {
  const { id, className, fileId } = props
  const item = useSelector((s) => s.storages.list[0])
  const pending = useSelector((s) => s.storages.pending)
  const dispatch = useDispatch()
  const history = useHistory()
  const classes = makeStyles({ link: { cursor: 'pointer' } })()

  useEffect(() => {
    if (id) {
      dispatch(storagesAsyncThunk.get(id))
    }
  }, [id])

  return (
    <>
      {id && item && (
        <Typography
          variant="body2"
          color="textSecondary"
          component="div"
          className={`${className} ${classes.link}`}
          onClick={() => history.push(`/app/${fileId}/storages/${id}`)}
        >
          <Icon>place</Icon> {item.name}
        </Typography>
      )}
    </>
  )
}

const Card = (props) => {
  const { item, classes, scan, edit, update, removeButtonClick, fileId } = props

  return (
    <>
      <Helmet>
        <title>{item.name || '(名称未設定)'} - 物品 - 持ち物管理表</title>
      </Helmet>
      <MuiCard className={classes.card}>
        <CardHeader avatar={<Icon>inventory</Icon>} title={item.name} />
        <CardContent>
          <Typography variant="body1" color="textPrimary" component="p">
            {item.description}
          </Typography>
        </CardContent>

        <CardContent className={classes.remarks}>
          <Typography
            variant="body2"
            color="textSecondary"
            component="div"
            className={classes.remark}
          >
            <Icon>layers</Icon> {item.quantities}
          </Typography>

          <StorageName
            id={item.storageId}
            className={classes.remark}
            fileId={fileId}
          />
        </CardContent>

        <CardActions className={classes.actions}>
          <IconButton aria-label="remove" onClick={removeButtonClick}>
            <Icon>delete</Icon>
          </IconButton>
          <IconButton
            aria-label="increment"
            onClick={() => update({ ...item, quantities: item.quantities + 1 })}
          >
            <Icon>add</Icon>
          </IconButton>
          <IconButton
            aria-label="decrement"
            onClick={() => update({ ...item, quantities: item.quantities - 1 })}
          >
            <Icon>remove</Icon>
          </IconButton>

          <IconButton aria-label="set storage" onClick={scan}>
            <Icon>edit_location</Icon>
          </IconButton>
          <IconButton aria-label="edit" onClick={edit}>
            <Icon>edit</Icon>
          </IconButton>
        </CardActions>
      </MuiCard>
    </>
  )
}
export default Card
