import { useSearchParams } from 'react-router-dom'

const useSearchword = () => {
  const [searchParams] = useSearchParams()
  return searchParams.get('keyword') || ''
}

export default useSearchword
