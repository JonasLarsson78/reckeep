export default (url: string, options?: RequestInit) => {
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .catch((error) => {
      console.error('Fetch error:', error)
      throw error
    })
}
