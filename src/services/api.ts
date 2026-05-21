import axios from 'axios'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: unknown
  requestId?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const apiBaseUrlFromEnv = String(import.meta.env.VITE_API_BASE_URL || '').trim()

const apiClient = axios.create({
  baseURL: apiBaseUrlFromEnv || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3000/api/v1'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth.token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => response,
  error => {
    const apiError = error?.response?.data as ApiResponse | undefined
    const message = apiError?.error || apiError?.message || error?.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export class ApiService {
  static async getAuthChallenge(
    purpose: 'login' | 'register'
  ): Promise<ApiResponse<import('../types').AuthChallenge>> {
    const response = await apiClient.post('/auth/challenge', { purpose })
    return response.data
  }

  static async register(params: {
    email: string
    password: string
    displayName?: string
    challengeId: string
    challengeProof: string
  }): Promise<ApiResponse<import('../types').AuthPayload>> {
    const response = await apiClient.post('/auth/register', params)
    return response.data
  }

  static async login(params: {
    email: string
    password: string
    challengeId: string
    challengeProof: string
  }): Promise<ApiResponse<import('../types').AuthPayload>> {
    const response = await apiClient.post('/auth/login', params)
    return response.data
  }

  static async getCurrentUser(): Promise<ApiResponse<import('../types').AuthUser>> {
    const response = await apiClient.get('/auth/me')
    return response.data
  }

  static async getUserProfile(): Promise<ApiResponse<import('../types').UserProfile>> {
    const response = await apiClient.get('/auth/profile')
    return response.data
  }

  static async updateUserProfile(
    params: import('../types').UpdateUserProfileRequest
  ): Promise<ApiResponse<import('../types').UserProfile>> {
    const response = await apiClient.put('/auth/profile', params)
    return response.data
  }

  static async appendPersonalInfoSessionMessage(params: {
    content: string
    role?: 'user' | 'assistant' | 'system'
  }): Promise<ApiResponse<import('../types').UserProfile>> {
    const response = await apiClient.post('/auth/profile/session', params)
    return response.data
  }

  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/password/forgot', { email })
    return response.data
  }

  static async resetPassword(params: {
    email: string
    token: string
    newPassword: string
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/password/reset', params)
    return response.data
  }

  static async requestUnlockEmail(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/unlock/request', { email })
    return response.data
  }

  static async verifyUnlock(params: {
    email: string
    token: string
  }): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/unlock/verify', params)
    return response.data
  }

  static async getProviders(): Promise<ApiResponse<import('../types').AIProvider[]>> {
    const response = await apiClient.get('/providers')
    return response.data
  }

  static async createProvider(
    data: import('../types').CreateProviderRequest
  ): Promise<ApiResponse<import('../types').AIProvider>> {
    const response = await apiClient.post('/providers', data)
    return response.data
  }

  static async updateProvider(
    id: string,
    data: Partial<import('../types').CreateProviderRequest>
  ): Promise<ApiResponse<import('../types').AIProvider>> {
    const response = await apiClient.put(`/providers/${id}`, data)
    return response.data
  }

  static async activateProvider(id: string): Promise<ApiResponse<import('../types').AIProvider>> {
    const response = await apiClient.post(`/providers/${id}/activate`)
    return response.data
  }

  static async deleteProvider(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/providers/${id}`)
    return response.data
  }

  static async discoverProviderModels(params: {
    baseUrl: string
    apiKey?: string
    providerId?: string
    timeoutMs?: number
  }): Promise<ApiResponse<string[]>> {
    const response = await apiClient.post('/providers/models/discover', params)
    return response.data
  }

  static async generateKnowledge(
    params: import('../types').GenerateKnowledgeParams
  ): Promise<ApiResponse<import('../types').KnowledgePoint[]>> {
    const response = await apiClient.post('/knowledge/generate', params)
    return response.data
  }

  static async getKnowledge(
    params: import('../types').FetchKnowledgeParams
  ): Promise<ApiResponse<PaginatedResponse<import('../types').KnowledgePoint>>> {
    const response = await apiClient.get('/knowledge', { params })
    return response.data
  }

  static async updateKnowledge(
    id: string,
    data: Partial<import('../types').KnowledgePoint>
  ): Promise<ApiResponse<import('../types').KnowledgePoint>> {
    const response = await apiClient.put(`/knowledge/${id}`, data)
    return response.data
  }

  static async deleteKnowledge(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/knowledge/${id}`)
    return response.data
  }

  static async createSession(
    params: import('../types').CreateSessionParams
  ): Promise<ApiResponse<import('../types').TutorSession>> {
    const response = await apiClient.post('/tutor/sessions', params)
    return response.data
  }

  static async getSession(id: string): Promise<ApiResponse<import('../types').TutorSession>> {
    const response = await apiClient.get(`/tutor/sessions/${id}`)
    return response.data
  }

  static async sendMessage(
    sessionId: string,
    message: string
  ): Promise<ApiResponse<{ response: string; usage?: unknown }>> {
    const response = await apiClient.post(`/tutor/sessions/${sessionId}/messages`, { message })
    return response.data
  }

  static async getMessages(
    sessionId: string,
    limit?: number
  ): Promise<ApiResponse<import('../types').TutorMessage[]>> {
    const response = await apiClient.get(`/tutor/sessions/${sessionId}/messages`, {
      params: limit ? { limit } : undefined
    })
    return response.data
  }

  static async closeSession(sessionId: string): Promise<ApiResponse<import('../types').TutorSession>> {
    const response = await apiClient.post(`/tutor/sessions/${sessionId}/close`)
    return response.data
  }

  static async getUserSessions(userId: string): Promise<ApiResponse<import('../types').TutorSession[]>> {
    const response = await apiClient.get('/tutor/sessions', { params: { userId } })
    return response.data
  }

  static async startInterview(params: {
    providerConfigId: string
    markdown: string
    targetRole?: string
  }): Promise<ApiResponse<import('../types').InterviewStartResponse>> {
    const response = await apiClient.post('/interview/start', params)
    return response.data
  }

  static async submitInterviewAnswer(params: {
    providerConfigId: string
    markdown: string
    targetRole?: string
    transcript: import('../types').InterviewTranscriptItem[]
    answer: string
  }): Promise<ApiResponse<import('../types').InterviewAnswerResponse>> {
    const response = await apiClient.post('/interview/answer', params)
    return response.data
  }
}

export default apiClient
