import React from 'react'
import { Helmet } from 'react-helmet'
import IconButton from '@mui/material/IconButton'
import { default as MuiCard } from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Icon from '@mui/material/Icon'
import Typography from '@mui/material/Typography'

const Card = (props) => {
  const { item, classes, edit } = props

  return (
    <>
      <Helmet>
        <title>{item.name || '(名称未設定)'} - 保管場所 - 持ち物管理表</title>
      </Helmet>
      <MuiCard className={classes.card}>
        <CardHeader avatar={<Icon>place</Icon>} title={item.name} />
        <CardContent>
          <Typography variant="body1" color="textPrimary" component="p">
            {item.description}
          </Typography>
        </CardContent>

        <CardActions className={classes.actions}>
          <IconButton aria-label="edit" onClick={edit}>
            <Icon>edit</Icon>
          </IconButton>
        </CardActions>
      </MuiCard>
    </>
  )
}
export default Card
