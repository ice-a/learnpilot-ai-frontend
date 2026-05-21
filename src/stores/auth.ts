import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ApiService } from '../services/api'
import type { AuthUser } from '../types'

const AUTH_TOKEN_KEY = 'auth.token'
const AUTH_USER_KEY = 'auth.user'

const sha256Hex = async (text: string): Promise<string> => {
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(text))
  const bytes = new Uint8Array(digest)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(AUTH_TOKEN_KEY) || '')
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const restoreUser = () => {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) {
      return
    }
    try {
      user.value = JSON.parse(raw) as AuthUser
    } catch {
      user.value = null
    }
  }

  const persistAuth = (nextToken: string, nextUser: AuthUser) => {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
  }

  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  const buildChallengeProof = async (
    purpose: 'login' | 'register',
    email: string,
    password: string
  ): Promise<{ challengeId: string; challengeProof: string }> => {
    const challengeResponse = await ApiService.getAuthChallenge(purpose)
    if (!challengeResponse.success || !challengeResponse.data) {
      throw new Error(challengeResponse.error || '获取挑战失败')
    }

    const emailNormalized = email.trim().toLowerCase()
    const proof = await sha256Hex(
      `${purpose}|${emailNormalized}|${password}|${challengeResponse.data.challengeText}`
    )
    return {
      challengeId: challengeResponse.data.challengeId,
      challengeProof: proof
    }
  }

  const login = async (params: { email: string; password: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const challenge = await buildChallengeProof('login', params.email, params.password)
      const response = await ApiService.login({
        email: params.email.trim().toLowerCase(),
        password: params.password,
        challengeId: challenge.challengeId,
        challengeProof: challenge.challengeProof
      })
      if (!response.success || !response.data) {
        throw new Error(response.error || '登录失败')
      }
      persistAuth(response.data.token, response.data.user)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (params: { email: string; password: string; displayName?: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const challenge = await buildChallengeProof('register', params.email, params.password)
      const response = await ApiService.register({
        email: params.email.trim().toLowerCase(),
        password: params.password,
        displayName: params.displayName?.trim() || undefined,
        challengeId: challenge.challengeId,
        challengeProof: challenge.challengeProof
      })
      if (!response.success || !response.data) {
        throw new Error(response.error || '注册失败')
      }
      persistAuth(response.data.token, response.data.user)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCurrentUser = async () => {
    if (!token.value) {
      return null
    }
    try {
      const response = await ApiService.getCurrentUser()
      if (!response.success || !response.data) {
        throw new Error(response.error || '获取用户信息失败')
      }
      user.value = response.data
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data))
      return response.data
    } catch (err) {
      clearAuth()
      throw err
    }
  }

  const requestPasswordReset = async (email: string) => {
    const response = await ApiService.forgotPassword(email.trim().toLowerCase())
    if (!response.success) {
      throw new Error(response.error || '发送重置邮件失败')
    }
  }

  const resetPassword = async (params: { email: string; token: string; newPassword: string }) => {
    const response = await ApiService.resetPassword({
      email: params.email.trim().toLowerCase(),
      token: params.token.trim(),
      newPassword: params.newPassword
    })
    if (!response.success) {
      throw new Error(response.error || '重置密码失败')
    }
  }

  const requestUnlockEmail = async (email: string) => {
    const response = await ApiService.requestUnlockEmail(email.trim().toLowerCase())
    if (!response.success) {
      throw new Error(response.error || '发送解锁邮件失败')
    }
  }

  const verifyUnlock = async (params: { email: string; token: string }) => {
    const response = await ApiService.verifyUnlock({
      email: params.email.trim().toLowerCase(),
      token: params.token.trim()
    })
    if (!response.success) {
      throw new Error(response.error || '邮箱验证失败')
    }
  }

  const logout = () => {
    clearAuth()
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  restoreUser()

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    fetchCurrentUser,
    requestPasswordReset,
    resetPassword,
    requestUnlockEmail,
    verifyUnlock,
    logout
  }
})
