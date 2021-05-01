import { useSelector } from 'react-redux'

const useSearchword = () => {
  return useSelector((s) => {
    const k = s.router.location.query.keyword
    if (k) {
      return decodeURIComponent(k)
    } else {
      return ''
    }
  })
}
export default useSearchword
