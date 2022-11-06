import React, { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@mui/styles'
import IconButton from '@mui/material/IconButton'
import { default as MuiCard } from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Icon from '@mui/material/Icon'
import Typography from '@mui/material/Typography'
import Interweave from 'interweave'
import { UrlMatcher } from 'interweave-autolink'

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
            <Interweave
              content={item.description}
              matchers={[new UrlMatcher('url')]}
            />
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

          {item.deadline && (
            <Typography
              variant="body2"
              color="textSecondary"
              component="div"
              className={classes.remark}
            >
              <Icon>event</Icon> {item.deadline}
            </Typography>
          )}

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
