import { makeStyles } from '@mui/styles'

const makeListStyles = makeStyles({
  header: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px',
  },
  linkContainer: {
    width: '100%',
  },
  link: {
    color: 'black',
    cursor: 'pointer',
    display: 'block',
    textDecoration: 'none',
  },
  deadline: {
    color: 'gray',
    fontSize: '80%',
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
