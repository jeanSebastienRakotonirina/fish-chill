import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getVessels = () => api.get('/vessels')
export const getVessel = (id) => api.get(`/vessels/${id}`)
export const getVesselDashboard = (id) => api.get(`/vessels/${id}/dashboard`)

export const getCatches = (params = {}) => api.get('/catches', { params })
export const getCatchStats = (params = {}) => api.get('/catches/stats', { params })

export const getNets = (params = {}) => api.get('/nets', { params })
export const acknowledgeAlert = (netId, alertId) =>
  api.post(`/nets/${netId}/alerts/${alertId}/ack`)

export const getHealth = () => api.get('/health')

export default api

export const getAiInsights = () => api.get('/ai/insights')
export const aiChat = (message, lang = 'fr') => api.post('/ai/chat', { message, lang })
