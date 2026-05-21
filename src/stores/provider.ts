import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '../services/api'
import type { AIProvider, CreateProviderRequest } from '../types'

export const useProviderStore = defineStore('provider', () => {
  const providers = ref<AIProvider[]>([])
  const activeProvider = ref<AIProvider | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchProviders = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.getProviders()
      if (!response.success || !response.data) {
        error.value = response.error || '获取提供商列表失败'
        return
      }

      providers.value = response.data
      activeProvider.value = response.data.find(item => item.isActive) || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取提供商列表失败'
    } finally {
      isLoading.value = false
    }
  }

  const createProvider = async (provider: CreateProviderRequest) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.createProvider(provider)
      if (!response.success || !response.data) {
        error.value = response.error || '创建提供商失败'
        throw new Error(error.value)
      }

      providers.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建提供商失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProvider = async (id: string, data: Partial<CreateProviderRequest>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.updateProvider(id, data)
      if (!response.success || !response.data) {
        error.value = response.error || '更新提供商失败'
        throw new Error(error.value)
      }

      const index = providers.value.findIndex(item => item._id === id)
      if (index !== -1) {
        providers.value[index] = response.data
      }

      if (activeProvider.value?._id === id) {
        activeProvider.value = response.data
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新提供商失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const activateProvider = async (provider: AIProvider) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.activateProvider(provider._id!)
      if (!response.success || !response.data) {
        error.value = response.error || '激活提供商失败'
        throw new Error(error.value)
      }

      providers.value = providers.value.map(item => ({
        ...item,
        isActive: item._id === provider._id
      }))
      activeProvider.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '激活提供商失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProvider = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.deleteProvider(id)
      if (!response.success) {
        error.value = response.error || '删除提供商失败'
        throw new Error(error.value)
      }

      providers.value = providers.value.filter(item => item._id !== id)
      if (activeProvider.value?._id === id) {
        activeProvider.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除提供商失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setActiveProvider = (provider: AIProvider) => {
    activeProvider.value = provider
  }

  const discoverModels = async (params: {
    baseUrl: string
    apiKey?: string
    providerId?: string
    timeoutMs?: number
  }) => {
    const response = await ApiService.discoverProviderModels(params)
    if (!response.success || !response.data) {
      throw new Error(response.error || '获取模型列表失败')
    }
    return response.data
  }

  return {
    providers,
    activeProvider,
    isLoading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    activateProvider,
    deleteProvider,
    setActiveProvider,
    discoverModels
  }
})
