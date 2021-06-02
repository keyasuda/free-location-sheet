import { makeStyles } from '@material-ui/core/styles'

const makeListStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px',
  },
  link: {
    cursor: 'pointer',
    display: 'block',
    margin: '1em',
    textDecoration: 'none',
  },
  paginator: {
    display: 'flex',
    justifyContent: 'center',
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
