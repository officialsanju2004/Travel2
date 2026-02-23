import axios from 'axios'

const BASE_URL = 'https://travel2-phi-seven.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// ✅ FIX — Always attach latest token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
    }
    return Promise.reject(error)
  }
)

export default api
