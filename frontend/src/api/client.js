import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isServerUnavailable =
      !error.response || [502, 503, 504].includes(error.response.status)

    if (isServerUnavailable && window.location.pathname !== '/servidor-indisponivel') {
      window.location.assign('/servidor-indisponivel')
    }

    return Promise.reject(error)
  },
)
