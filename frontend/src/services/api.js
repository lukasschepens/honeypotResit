import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const login = (credentials) => apiClient.post('/auth/login', credentials)
export const register = (userData) => apiClient.post('/auth/register', userData)
export const getCurrentUser = () => apiClient.get('/auth/me')
export const logout = () => apiClient.post('/auth/logout')

// Posts endpoints
export const getPosts = (params) => apiClient.get('/posts', { params })
export const getPost = (id) => apiClient.get(`/posts/${id}`)
export const createPost = (data) => apiClient.post('/posts', data)
export const deletePost = (id) => apiClient.delete(`/posts/${id}`)

// Comments endpoints
export const getComments = (postId, params) => apiClient.get(`/comments/${postId}`, { params })
export const createComment = (data) => apiClient.post('/comments', data)
export const deleteComment = (id) => apiClient.delete(`/comments/${id}`)

// Edit endpoints
export const editPost = (id, data) => apiClient.put(`/edit/post/${id}`, data)
export const editComment = (id, data) => apiClient.put(`/edit/comment/${id}`, data)
export const editAccount = (data) => apiClient.put('/edit/account', data)

// Account endpoints
export const getAccount = () => apiClient.get('/account')
export const getAccountPosts = (params) => apiClient.get('/account/posts', { params })
export const getAccountComments = (params) => apiClient.get('/account/comments', { params })
export const getAccountFiles = (params) => apiClient.get('/account/files', { params })
export const deleteAccount = (data) => apiClient.delete('/account', { data })

// Upload endpoints
export const uploadFiles = (formData) => apiClient.post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})
export const getUploads = (params) => apiClient.get('/upload', { params })
export const getUpload = (id) => apiClient.get(`/upload/${id}`)
export const deleteUpload = (id) => apiClient.delete(`/upload/${id}`)
export const getUploadStats = () => apiClient.get('/upload/stats/overview')

// Honeypot endpoints (for demonstration purposes - would normally be hidden)
export const getHoneypot = () => apiClient.get('/honeypot')
export const getHoneypotAdmin = () => apiClient.get('/honeypot/admin')
export const getHoneypotConfig = () => apiClient.get('/honeypot/config')

export default apiClient
