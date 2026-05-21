<template>
  <div class="providers-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">AI 提供商配置</h1>

        <div
          v-if="needsProviderSetup"
          class="rounded-lg border border-amber-300 bg-amber-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <h2 class="text-base font-semibold text-amber-900">请先配置并激活 AI 提供商</h2>
            <p class="text-sm text-amber-800 mt-1">
              未配置模型时，路线生成与对话功能不可用。完成激活后会自动返回上一页继续。
            </p>
          </div>
          <button
            v-if="hasRedirectTarget && providerStore.activeProvider"
            type="button"
            class="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold"
            @click="continueToTarget"
          >
            继续返回上一页
          </button>
        </div>

        <div class="bg-white rounded-lg shadow-md">
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800">提供商列表</h2>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-md" @click="showAddForm = !showAddForm">
              {{ showAddForm ? '取消' : '添加提供商' }}
            </button>
          </div>

          <div class="p-6">
            <div v-if="providerStore.isLoading" class="text-center text-gray-500">加载中...</div>
            <div v-else-if="providerStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">{{ providerStore.error }}</div>

            <div v-else-if="providerStore.providers.length" class="space-y-4">
              <div v-for="provider in providerStore.providers" :key="provider._id" class="border border-gray-200 rounded-lg p-4">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-semibold text-gray-800">{{ provider.name }}</h3>
                      <span :class="['px-2 py-1 text-xs rounded-full', provider.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600']">
                        {{ provider.isActive ? '已激活' : '未激活' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">模型：{{ provider.modelId }}</p>
                    <p class="text-sm text-gray-600">Base URL：{{ provider.baseUrl }}</p>
                    <p class="text-sm text-gray-600">超时：{{ provider.timeoutMs }}ms</p>
                    <p class="text-sm text-gray-600">
                      TTS：{{ provider.ttsEnabled ? `已启用（${provider.ttsModelId || '-'} / ${provider.ttsVoice || '-'}）` : '未启用' }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">创建时间：{{ formatDate(provider.createdAt) }}</p>
                  </div>

                  <div class="flex gap-2">
                    <button class="px-3 py-1 rounded-md text-sm bg-green-600 text-white disabled:bg-gray-300" :disabled="provider.isActive || providerStore.isLoading" @click="activateProvider(provider)">
                      激活
                    </button>
                    <button class="px-3 py-1 rounded-md text-sm bg-blue-600 text-white" :disabled="providerStore.isLoading" @click="editProvider(provider)">
                      编辑
                    </button>
                    <button class="px-3 py-1 rounded-md text-sm bg-red-600 text-white disabled:bg-gray-300" :disabled="providerStore.isLoading || provider.isActive" @click="deleteProvider(provider)">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center text-gray-500">暂无提供商配置</div>
          </div>
        </div>

        <div v-if="showAddForm || editingProvider" class="bg-white rounded-lg shadow-md">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800">{{ editingProvider ? '编辑提供商' : '添加新提供商' }}</h2>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input v-model="form.name" type="text" required class="w-full border rounded-md px-3 py-2" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input v-model="form.baseUrl" type="url" required class="w-full border rounded-md px-3 py-2" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input v-model="form.apiKey" type="password" :required="!editingProvider" class="w-full border rounded-md px-3 py-2" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">模型 ID</label>
                <div class="flex gap-2">
                  <input v-model="form.modelId" type="text" required class="w-full border rounded-md px-3 py-2" />
                  <button
                    type="button"
                    class="px-3 py-2 rounded-md border border-blue-200 text-blue-700 bg-blue-50 whitespace-nowrap disabled:opacity-60"
                    :disabled="isFetchingModels"
                    @click="fetchModels"
                  >
                    {{ isFetchingModels ? '获取中...' : '获取模型' }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">OpenAI 兼容格式，读取 `/models`（失败时自动尝试 `/v1/models`）。</p>
              </div>

              <div v-if="modelOptions.length" class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">选择已获取模型</label>
                <select v-model="form.modelId" class="w-full border rounded-md px-3 py-2">
                  <option v-for="model in modelOptions" :key="model" :value="model">{{ model }}</option>
                </select>
              </div>

              <div v-if="modelFetchError" class="md:col-span-2 bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-700 text-sm">
                {{ modelFetchError }}
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">超时（ms）</label>
                <input v-model.number="form.timeoutMs" type="number" min="1000" max="300000" step="1000" class="w-full border rounded-md px-3 py-2" />
              </div>

              <div class="md:col-span-2 border-t pt-3 mt-2">
                <label class="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input v-model="form.ttsEnabled" type="checkbox" />
                  启用 TTS
                </label>
              </div>

              <template v-if="form.ttsEnabled">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">TTS 模型 ID</label>
                  <input v-model="form.ttsModelId" type="text" class="w-full border rounded-md px-3 py-2" placeholder="例如：gpt-4o-mini-tts" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">TTS 音色</label>
                  <input v-model="form.ttsVoice" type="text" class="w-full border rounded-md px-3 py-2" placeholder="例如：alloy" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">TTS 格式</label>
                  <select v-model="form.ttsFormat" class="w-full border rounded-md px-3 py-2">
                    <option value="mp3">mp3</option>
                    <option value="wav">wav</option>
                    <option value="pcm">pcm</option>
                    <option value="opus">opus</option>
                    <option value="flac">flac</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">TTS 语速</label>
                  <input v-model.number="form.ttsSpeed" type="number" min="0.25" max="4" step="0.05" class="w-full border rounded-md px-3 py-2" />
                </div>
              </template>
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">{{ error }}</div>

            <div class="flex justify-end gap-2">
              <button type="button" class="px-4 py-2 border border-gray-300 rounded-md" @click="cancelEdit">取消</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : (editingProvider ? '更新' : '添加') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProviderStore } from '../../stores/provider'
import type { CreateProviderRequest, AIProvider } from '../../types'

const providerStore = useProviderStore()
const route = useRoute()
const router = useRouter()

const firstQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return String(value[0] || '')
  }
  return typeof value === 'string' ? value : ''
}

const needsProviderSetup = computed(() => firstQueryValue(route.query.requiredProvider) === '1')
const redirectAfterSetup = computed(() => {
  const target = firstQueryValue(route.query.redirect).trim()
  if (!target.startsWith('/') || target.startsWith('/settings/providers')) {
    return ''
  }
  return target
})
const hasRedirectTarget = computed(() => redirectAfterSetup.value.length > 0)

const showAddForm = ref(false)
const editingProvider = ref<AIProvider | null>(null)
const isSubmitting = ref(false)
const isFetchingModels = ref(false)
const error = ref<string | null>(null)
const modelFetchError = ref<string | null>(null)
const modelOptions = ref<string[]>([])

const form = reactive<CreateProviderRequest & { timeoutMs: number }>({
  name: '',
  baseUrl: '',
  modelId: '',
  apiKey: '',
  timeoutMs: 30000,
  ttsEnabled: false,
  ttsModelId: '',
  ttsVoice: '',
  ttsFormat: 'mp3',
  ttsSpeed: 1
})

const resetForm = () => {
  form.name = ''
  form.baseUrl = ''
  form.modelId = ''
  form.apiKey = ''
  form.timeoutMs = 30000
  form.ttsEnabled = false
  form.ttsModelId = ''
  form.ttsVoice = ''
  form.ttsFormat = 'mp3'
  form.ttsSpeed = 1
  error.value = null
  modelFetchError.value = null
  modelOptions.value = []
}

const cancelEdit = () => {
  showAddForm.value = false
  editingProvider.value = null
  resetForm()
}

const editProvider = (provider: AIProvider) => {
  editingProvider.value = provider
  showAddForm.value = false

  form.name = provider.name
  form.baseUrl = provider.baseUrl
  form.modelId = provider.modelId
  form.apiKey = ''
  form.timeoutMs = provider.timeoutMs
  form.ttsEnabled = !!provider.ttsEnabled
  form.ttsModelId = provider.ttsModelId || ''
  form.ttsVoice = provider.ttsVoice || ''
  form.ttsFormat = provider.ttsFormat || 'mp3'
  form.ttsSpeed = provider.ttsSpeed || 1
  modelFetchError.value = null
  modelOptions.value = []
}

const fetchModels = async () => {
  try {
    isFetchingModels.value = true
    modelFetchError.value = null

    if (!form.baseUrl.trim()) {
      modelFetchError.value = '请先填写 Base URL'
      return
    }

    const models = await providerStore.discoverModels({
      baseUrl: form.baseUrl.trim(),
      apiKey: form.apiKey.trim() || undefined,
      providerId: editingProvider.value?._id,
      timeoutMs: form.timeoutMs
    })

    modelOptions.value = models
    if (models.length === 0) {
      modelFetchError.value = '没有拉取到可用模型，请检查 Base URL 和 API Key。'
      return
    }

    if (!form.modelId.trim()) {
      form.modelId = models[0]
    }
  } catch (err) {
    modelFetchError.value = err instanceof Error ? err.message : '获取模型失败'
  } finally {
    isFetchingModels.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = null
    modelFetchError.value = null

    if (form.ttsEnabled && (!form.ttsModelId?.trim() || !form.ttsVoice?.trim())) {
      error.value = '启用 TTS 时必须填写 TTS 模型 ID 和音色'
      return
    }

    if (editingProvider.value?._id) {
      const updateData: Partial<CreateProviderRequest> = {
        name: form.name,
        baseUrl: form.baseUrl,
        modelId: form.modelId,
        timeoutMs: form.timeoutMs,
        ttsEnabled: !!form.ttsEnabled,
        ttsModelId: form.ttsEnabled ? form.ttsModelId : undefined,
        ttsVoice: form.ttsEnabled ? form.ttsVoice : undefined,
        ttsFormat: form.ttsEnabled ? form.ttsFormat : undefined,
        ttsSpeed: form.ttsEnabled ? form.ttsSpeed : undefined
      }

      if (form.apiKey.trim()) {
        updateData.apiKey = form.apiKey
      }

      await providerStore.updateProvider(editingProvider.value._id, updateData)
    } else {
      await providerStore.createProvider({
        name: form.name,
        baseUrl: form.baseUrl,
        modelId: form.modelId,
        apiKey: form.apiKey,
        timeoutMs: form.timeoutMs,
        ttsEnabled: !!form.ttsEnabled,
        ttsModelId: form.ttsEnabled ? form.ttsModelId : undefined,
        ttsVoice: form.ttsEnabled ? form.ttsVoice : undefined,
        ttsFormat: form.ttsEnabled ? form.ttsFormat : undefined,
        ttsSpeed: form.ttsEnabled ? form.ttsSpeed : undefined
      })
    }

    cancelEdit()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败'
  } finally {
    isSubmitting.value = false
  }
}

const activateProvider = async (provider: AIProvider) => {
  if (provider.isActive) {
    return
  }

  await providerStore.activateProvider(provider)
  if (needsProviderSetup.value && hasRedirectTarget.value) {
    await router.replace(redirectAfterSetup.value)
  }
}

const deleteProvider = async (provider: AIProvider) => {
  if (provider.isActive) {
    window.alert('无法删除已激活的提供商')
    return
  }

  if (provider._id && window.confirm(`确定要删除提供商「${provider.name}」吗？`)) {
    await providerStore.deleteProvider(provider._id)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return ''
  }
  return new Date(dateString).toLocaleString('zh-CN')
}

const continueToTarget = async () => {
  if (!hasRedirectTarget.value) {
    return
  }
  await router.replace(redirectAfterSetup.value)
}

onMounted(async () => {
  await providerStore.fetchProviders()
  if (needsProviderSetup.value && providerStore.activeProvider && hasRedirectTarget.value) {
    await router.replace(redirectAfterSetup.value)
  }
})
</script>
