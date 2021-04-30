const authorizedResource = (u) => {
  const user = u
  const request = async (params) => {
    let authorizedResponse = u.getAuthResponse()
    if (Number(new Date()) > authorizedResponse.expires_at) {
      authorizedResponse = await u.reloadAuthResponse()
    }
    return fetch(
      `${params.url}&access_token=${authorizedResponse.access_token}`
    )
  }

  return { request }
}

export default authorizedResource
