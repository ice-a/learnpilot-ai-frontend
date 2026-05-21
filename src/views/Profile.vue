<template>
  <div class="profile-page min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-3xl font-bold text-gray-800">个人中心</h1>
          <router-link
            to="/learning/plan"
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回学习计划
          </router-link>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 text-sm text-emerald-700">
          {{ successMessage }}
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800">个人信息与模型配置</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                v-model="displayName"
                type="text"
                maxlength="60"
                class="w-full border rounded-md px-3 py-2"
                placeholder="输入昵称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">个人模型配置</label>
              <select v-model="preferredProviderConfigId" class="w-full border rounded-md px-3 py-2">
                <option value="">跟随当前激活模型</option>
                <option
                  v-for="provider in providerStore.providers"
                  :key="provider._id"
                  :value="provider._id"
                >
                  {{ provider.name }}（{{ provider.modelId }}）
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">学习方向</label>
              <input
                v-model="learningDirection"
                type="text"
                maxlength="120"
                class="w-full border rounded-md px-3 py-2"
                placeholder="例如：前端工程化、数据结构"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">学习目标</label>
              <input
                v-model="learningGoal"
                type="text"
                maxlength="240"
                class="w-full border rounded-md px-3 py-2"
                placeholder="例如：3 个月内完成面试准备"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800">个人面试信息</h2>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">目标岗位</label>
              <input
                v-model="interviewTargetRole"
                type="text"
                maxlength="120"
                class="w-full border rounded-md px-3 py-2"
                placeholder="例如：前端开发工程师"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">面试关注方向</label>
              <input
                v-model="interviewFocusDirection"
                type="text"
                maxlength="240"
                class="w-full border rounded-md px-3 py-2"
                placeholder="例如：项目深挖、性能优化、系统设计"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">面试自我介绍素材</label>
              <textarea
                v-model="interviewSelfIntroduction"
                rows="4"
                maxlength="1200"
                class="w-full border rounded-md px-3 py-2"
                placeholder="用于面试辅导默认填充的个人介绍内容"
              />
            </div>
          </div>
          <div class="flex justify-end">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:bg-gray-400"
              :disabled="isLoading || isSaving"
              @click="saveProfile"
            >
              {{ isSaving ? '保存中...' : '保存个人信息' }}
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">个人信息会话</h2>
            <p class="text-xs text-gray-500 mt-1">记录你自己的学习背景、问题和阶段总结，后续可持续补充。</p>
          </div>

          <div class="h-72 overflow-y-auto bg-slate-50 p-4 space-y-3">
            <div
              v-for="(item, index) in sessionItems"
              :key="`${item.createdAt}_${index}`"
              :class="[
                'rounded-lg px-3 py-2 text-sm',
                item.role === 'user'
                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                  : item.role === 'assistant'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-gray-100 border border-gray-200 text-gray-800'
              ]"
            >
              <div class="text-[11px] mb-1 opacity-70">
                {{ roleLabelMap[item.role] }} · {{ formatTime(item.createdAt) }}
              </div>
              <div class="whitespace-pre-wrap">{{ item.content }}</div>
            </div>
            <div v-if="!sessionItems.length" class="text-sm text-gray-500 text-center py-8">
              暂无会话记录
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 bg-white space-y-3">
            <textarea
              v-model="newSessionContent"
              rows="3"
              maxlength="500"
              class="w-full border rounded-md px-3 py-2"
              placeholder="输入一段个人信息会话内容，例如：我最近卡在了数组双指针..."
            />
            <div class="flex justify-end">
              <button
                class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:bg-gray-400"
                :disabled="isAppendingSession || !newSessionContent.trim()"
                @click="appendSessionMessage"
              >
                {{ isAppendingSession ? '记录中...' : '添加会话记录' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ApiService } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useProviderStore } from '../stores/provider'
import type { UserProfile } from '../types'

type SessionItem = UserProfile['personalInfoSession'][number]

const providerStore = useProviderStore()
const authStore = useAuthStore()

const displayName = ref('')
const learningDirection = ref('')
const learningGoal = ref('')
const preferredProviderConfigId = ref('')

const interviewTargetRole = ref('')
const interviewFocusDirection = ref('')
const interviewSelfIntroduction = ref('')

const sessionItems = ref<SessionItem[]>([])
const newSessionContent = ref('')

const isLoading = ref(true)
const isSaving = ref(false)
const isAppendingSession = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const roleLabelMap: Record<SessionItem['role'], string> = {
  user: '我',
  assistant: 'AI',
  system: '系统'
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const applyProfile = (profile: UserProfile) => {
  displayName.value = profile.displayName || ''
  learningDirection.value = profile.learningDirection || ''
  learningGoal.value = profile.learningGoal || ''
  preferredProviderConfigId.value = profile.preferredProviderConfigId || ''
  interviewTargetRole.value = profile.interviewProfile?.targetRole || ''
  interviewFocusDirection.value = profile.interviewProfile?.focusDirection || ''
  interviewSelfIntroduction.value = profile.interviewProfile?.selfIntroduction || ''
  sessionItems.value = profile.personalInfoSession || []
}

const loadProfile = async () => {
  clearMessages()
  isLoading.value = true
  try {
    await providerStore.fetchProviders()
    const response = await ApiService.getUserProfile()
    if (!response.success || !response.data) {
      throw new Error(response.error || '获取个人信息失败')
    }
    applyProfile(response.data)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取个人信息失败'
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  clearMessages()
  isSaving.value = true
  try {
    const response = await ApiService.updateUserProfile({
      displayName: displayName.value.trim(),
      learningDirection: learningDirection.value.trim() || undefined,
      learningGoal: learningGoal.value.trim() || undefined,
      preferredProviderConfigId: preferredProviderConfigId.value || null,
      interviewProfile: {
        targetRole: interviewTargetRole.value.trim() || undefined,
        focusDirection: interviewFocusDirection.value.trim() || undefined,
        selfIntroduction: interviewSelfIntroduction.value.trim() || undefined
      }
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || '保存个人信息失败')
    }
    applyProfile(response.data)
    await authStore.fetchCurrentUser()
    successMessage.value = '个人信息已保存'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存个人信息失败'
  } finally {
    isSaving.value = false
  }
}

const appendSessionMessage = async () => {
  const content = newSessionContent.value.trim()
  if (!content) {
    return
  }

  clearMessages()
  isAppendingSession.value = true
  try {
    const response = await ApiService.appendPersonalInfoSessionMessage({ content, role: 'user' })
    if (!response.success || !response.data) {
      throw new Error(response.error || '记录个人会话失败')
    }
    applyProfile(response.data)
    newSessionContent.value = ''
    successMessage.value = '会话记录已添加'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '记录个人会话失败'
  } finally {
    isAppendingSession.value = false
  }
}

const formatTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

onMounted(() => {
  void loadProfile()
})
</script>
