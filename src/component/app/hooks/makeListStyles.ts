import { makeStyles } from '@material-ui/core/styles'

const makeListStyles = makeStyles({
  link: {
    cursor: 'pointer',
    display: 'block',
    margin: '1em',
    textDecoration: 'none',
  },
  fab: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
  },
  actions: {
    justifyContent: 'space-between',
  },
})
export default makeListStyles
