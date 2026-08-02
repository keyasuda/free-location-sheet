import { useSearchParams } from 'react-router'

const useSearchword = () => {
  const [searchParams] = useSearchParams()
  return searchParams.get('keyword') || ''
}

export default useSearchword
