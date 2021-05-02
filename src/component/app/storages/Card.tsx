import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import { default as MuiCard } from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'

const Card = (props) => {
  const { item, classes, edit } = props

  return (
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
  )
}
export default Card
