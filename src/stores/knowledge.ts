import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiService } from '../services/api'
import type { KnowledgePoint, GenerateKnowledgeParams, FetchKnowledgeParams } from '../types'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const knowledgePoints = ref<KnowledgePoint[]>([])
  const isGenerating = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const currentLimit = ref(20)

  const generateKnowledge = async (params: GenerateKnowledgeParams) => {
    try {
      isGenerating.value = true
      error.value = null

      const response = await ApiService.generateKnowledge(params)
      if (!response.success || !response.data) {
        error.value = response.error || '生成知识点失败'
        throw new Error(error.value)
      }

      knowledgePoints.value = response.data

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成知识点失败'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const fetchKnowledge = async (params: FetchKnowledgeParams) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.getKnowledge(params)
      if (!response.success || !response.data) {
        error.value = response.error || '获取知识点失败'
        throw new Error(error.value)
      }

      knowledgePoints.value = response.data.data
      total.value = response.data.total
      currentPage.value = response.data.page
      currentLimit.value = response.data.limit
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取知识点失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateKnowledge = async (id: string, data: Partial<KnowledgePoint>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.updateKnowledge(id, data)
      if (!response.success || !response.data) {
        error.value = response.error || '更新知识点失败'
        throw new Error(error.value)
      }

      const index = knowledgePoints.value.findIndex(item => item._id === id)
      if (index !== -1) {
        knowledgePoints.value[index] = response.data
      }

      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新知识点失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteKnowledge = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ApiService.deleteKnowledge(id)
      if (!response.success) {
        error.value = response.error || '删除知识点失败'
        throw new Error(error.value)
      }

      knowledgePoints.value = knowledgePoints.value.filter(item => item._id !== id)
      total.value = Math.max(0, total.value - 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除知识点失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearKnowledge = () => {
    knowledgePoints.value = []
    total.value = 0
    currentPage.value = 1
  }

  const getKnowledgeByDifficulty = (difficulty: number) => {
    return knowledgePoints.value.filter(item => item.difficulty === difficulty)
  }

  const getKnowledgeByChapter = (chapter: string) => {
    return knowledgePoints.value.filter(item => item.chapter === chapter)
  }

  const getChapters = () => {
    return [...new Set(knowledgePoints.value.map(item => item.chapter))].sort()
  }

  return {
    knowledgePoints,
    isGenerating,
    isLoading,
    error,
    total,
    currentPage,
    currentLimit,
    generateKnowledge,
    fetchKnowledge,
    updateKnowledge,
    deleteKnowledge,
    clearKnowledge,
    getKnowledgeByDifficulty,
    getKnowledgeByChapter,
    getChapters
  }
})
