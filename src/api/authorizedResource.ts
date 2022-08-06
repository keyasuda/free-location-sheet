const authorizedResource = (getToken: () => string) => {
  const request = async (params) => {
    const token = getToken()
    return fetch(`${params.url}&access_token=${token['access_token']}`)
  }

  return { request }
}

export default authorizedResource
