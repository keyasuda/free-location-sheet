import { makeStyles } from 'tss-react/mui'

const makeListStyles = makeStyles()({
  card: {
    margin: '10px',
  },
  input: {
    width: '100%',
  },
  actions: {
    justifyContent: 'space-between',
  },
  remarks: { display: 'flex' },
  remark: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0.5em 0 0',
  },
})
export default makeListStyles
