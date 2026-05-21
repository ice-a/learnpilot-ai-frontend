import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '../services/api'
import type { TutorSession, TutorMessage, CreateSessionParams } from '../types'

export const useTutorStore = defineStore('tutor', () => {
  const currentSession = ref<TutorSession | null>(null)
  const messages = ref<TutorMessage[]>([])
  const sessions = ref<TutorSession[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const createSession = async (params: CreateSessionParams) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.createSession(params)
      if (!response.success || !response.data) {
        error.value = response.error || '创建会话失败'
        throw new Error(error.value)
      }

      currentSession.value = response.data
      messages.value = []
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建会话失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getSession = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.getSession(id)
      if (!response.success || !response.data) {
        error.value = response.error || '获取会话失败'
        throw new Error(error.value)
      }

      currentSession.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取会话失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentSession.value?._id) {
      throw new Error('没有可用会话')
    }

    try {
      isLoading.value = true
      error.value = null

      const now = new Date().toISOString()
      const optimisticUserMessage: TutorMessage = {
        _id: `tmp_user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sessionId: currentSession.value._id,
        role: 'user',
        content,
        createdAt: now,
        updatedAt: now
      }
      messages.value = [...messages.value, optimisticUserMessage]

      const response = await ApiService.sendMessage(currentSession.value._id, content)
      if (!response.success || !response.data) {
        error.value = response.error || '发送消息失败'
        throw new Error(error.value)
      }

      const assistantNow = new Date().toISOString()
      const optimisticAssistantMessage: TutorMessage = {
        _id: `tmp_assistant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sessionId: currentSession.value._id,
        role: 'assistant',
        content: response.data.response,
        tokenUsage: response.data.usage as TutorMessage['tokenUsage'],
        createdAt: assistantNow,
        updatedAt: assistantNow
      }
      messages.value = [...messages.value, optimisticAssistantMessage]
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchMessages = async (sessionId?: string) => {
    const id = sessionId || currentSession.value?._id
    if (!id) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.getMessages(id)
      if (!response.success || !response.data) {
        error.value = response.error || '获取消息失败'
        throw new Error(error.value)
      }

      messages.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取消息失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const closeSession = async (sessionId?: string) => {
    const id = sessionId || currentSession.value?._id
    if (!id) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.closeSession(id)
      if (!response.success || !response.data) {
        error.value = response.error || '结束会话失败'
        throw new Error(error.value)
      }

      if (currentSession.value?._id === id) {
        currentSession.value = null
        messages.value = []
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '结束会话失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserSessions = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.getUserSessions(userId)
      if (!response.success || !response.data) {
        error.value = response.error || '获取用户会话失败'
        throw new Error(error.value)
      }

      sessions.value = response.data
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户会话失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearCurrentSession = () => {
    currentSession.value = null
    messages.value = []
  }

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) {
      return ''
    }

    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRecentSessions = (limit = 5) => {
    return sessions.value
      .filter(item => item.status === 'active')
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, limit)
  }

  return {
    currentSession,
    messages,
    sessions,
    isLoading,
    error,
    createSession,
    getSession,
    sendMessage,
    fetchMessages,
    closeSession,
    fetchUserSessions,
    clearCurrentSession,
    formatMessageTime,
    getRecentSessions
  }
})
