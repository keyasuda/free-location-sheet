import { useSelector } from 'react-redux'

const useSearchword = () => {
  return useSelector((s) => {
    const query = new URLSearchParams(s.router.location.search)
    const k = query.get('keyword')
    if (k) {
      return decodeURIComponent(k)
    } else {
      return ''
    }
  })
}
export default useSearchword
