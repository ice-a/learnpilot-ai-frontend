<template>
  <div class="interview-page min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 class="text-3xl font-bold text-gray-800">面试辅导</h1>
          <router-link
            to="/learning/plan"
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回学习计划
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">目标岗位（选填）</label>
              <input
                v-model="targetRole"
                type="text"
                maxlength="120"
                class="w-full border rounded-md px-3 py-2"
                placeholder="例如：前端开发工程师"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">上传 Markdown 文档</label>
              <input
                type="file"
                accept=".md,text/markdown,text/plain"
                class="w-full border rounded-md px-3 py-2 bg-white"
                @change="onMarkdownFileChange"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">候选人材料（Markdown）</label>
            <textarea
              v-model="markdownContent"
              rows="10"
              class="w-full border rounded-md px-3 py-2 font-mono text-sm"
              placeholder="请粘贴简历、项目经历或学习笔记（Markdown 格式）"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:bg-gray-400"
              :disabled="isStarting || !canStartInterview"
              @click="startInterview"
            >
              {{ isStarting ? '正在生成首题...' : '开始面试辅导' }}
            </button>

            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
              <input v-model="ttsEnabled" type="checkbox" />
              语音朗读面试题（免费 TTS）
            </label>

            <select
              v-model="selectedVoiceURI"
              class="border rounded-md px-2 py-1 text-sm"
              :disabled="!ttsEnabled"
            >
              <option value="">系统默认音色</option>
              <option v-for="voice in availableVoices" :key="voice.voiceURI" :value="voice.voiceURI">
                {{ voice.name }}（{{ voice.lang }}）
              </option>
            </select>
          </div>
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {{ errorMessage }}
        </div>

        <div v-if="messages.length" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="border-b border-gray-200 px-6 py-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h2 class="text-lg font-semibold text-gray-800">面试对话</h2>
              <div class="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                当前分值：{{ totalScore }}
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">AI 会先提问，再根据你的回答给出分析并继续追问。</p>
          </div>

          <div ref="messageContainer" class="h-[30rem] overflow-y-auto p-5 bg-slate-50 space-y-4">
            <div
              v-for="item in messages"
              :key="item.id"
              :class="['flex', item.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div
                :class="[
                  'max-w-[90%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                  item.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : item.kind === 'analysis'
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-white border border-gray-200 text-gray-800'
                ]"
              >
                <div
                  v-if="item.role === 'assistant'"
                  class="text-[11px] uppercase tracking-wide mb-1"
                  :class="item.kind === 'analysis' ? 'text-amber-600' : 'text-gray-400'"
                >
                  {{ item.kind === 'analysis' ? '分析' : '提问' }}
                </div>
                <div>{{ item.content }}</div>
                <div
                  v-if="item.kind === 'analysis' && item.scoreDelta !== undefined"
                  class="mt-2 text-xs"
                  :class="item.scoreDelta >= 0 ? 'text-emerald-700' : 'text-red-700'"
                >
                  {{ item.scoreDelta >= 0 ? '加分' : '减分' }}：
                  {{ item.scoreDelta > 0 ? `+${item.scoreDelta}` : item.scoreDelta }}
                  （{{ item.scoreReason || '本轮无额外说明' }}）
                </div>
              </div>
            </div>

            <div v-if="isSubmitting" class="text-sm text-gray-500">AI 正在分析并生成下一题...</div>
          </div>

          <form class="p-5 border-t border-gray-200 bg-white space-y-3" @submit.prevent="submitAnswer">
            <label class="block text-sm font-medium text-gray-700">你的回答</label>
            <textarea
              v-model="answerInput"
              rows="4"
              class="w-full border rounded-md px-3 py-2"
              placeholder="请输入你的回答"
              :disabled="isSubmitting"
            />
            <div class="flex justify-end">
              <button
                type="submit"
                class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 text-sm font-semibold disabled:bg-gray-400"
                :disabled="isSubmitting || !answerInput.trim() || !messages.length"
              >
                {{ isSubmitting ? '提交中...' : '提交回答' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ApiService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useProviderStore } from '../../stores/provider'
import type { InterviewTranscriptItem } from '../../types'

type InterviewMessageKind = 'question' | 'analysis'

interface InterviewMessage {
  id: string
  role: 'assistant' | 'user'
  kind: InterviewMessageKind
  content: string
  scoreDelta?: number
  scoreReason?: string
}

const providerStore = useProviderStore()
const authStore = useAuthStore()
const route = useRoute()

const targetRole = ref(typeof route.query.role === 'string' ? route.query.role : '')
const markdownContent = ref('')
const answerInput = ref('')
const isStarting = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const messages = ref<InterviewMessage[]>([])
const messageContainer = ref<HTMLElement | null>(null)
const totalScore = ref(60)
const preferredProviderId = ref('')

const ttsEnabled = ref(false)
const selectedVoiceURI = ref('')
const availableVoices = ref<SpeechSynthesisVoice[]>([])
const speakRunId = ref(0)

const selectedProviderId = computed(() => {
  const preferred = preferredProviderId.value || authStore.user?.preferredProviderConfigId || ''
  const preferredExists = providerStore.providers.some(item => item._id === preferred)
  if (preferred && preferredExists) {
    return preferred
  }
  return providerStore.activeProvider?._id || ''
})

const canStartInterview = computed(() => {
  return !!selectedProviderId.value && markdownContent.value.trim().length >= 20
})

const normalizeError = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback
}

const getSpeechSynthesis = (): SpeechSynthesis | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null
  }
  return window.speechSynthesis
}

const loadVoices = () => {
  const synth = getSpeechSynthesis()
  if (!synth) {
    return
  }
  const allVoices = synth.getVoices()
  const preferred = allVoices.filter(voice => voice.lang.toLowerCase().startsWith('zh'))
  availableVoices.value = preferred.length > 0 ? preferred : allVoices
}

const resolveVoice = (): SpeechSynthesisVoice | undefined => {
  if (!selectedVoiceURI.value) {
    return undefined
  }
  return availableVoices.value.find(voice => voice.voiceURI === selectedVoiceURI.value)
}

const stopSpeaking = () => {
  speakRunId.value += 1
  const synth = getSpeechSynthesis()
  if (synth) {
    synth.cancel()
  }
}

const speakQuestion = (text: string) => {
  if (!ttsEnabled.value || !text.trim()) {
    return
  }

  const synth = getSpeechSynthesis()
  if (!synth) {
    return
  }

  stopSpeaking()
  const runId = ++speakRunId.value
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'zh-CN'
  utterance.rate = 0.95
  utterance.pitch = 1
  const voice = resolveVoice()
  if (voice) {
    utterance.voice = voice
  }
  utterance.onend = () => {
    if (runId !== speakRunId.value) {
      return
    }
  }
  synth.speak(utterance)
}

const scrollToBottom = () => {
  if (!messageContainer.value) {
    return
  }
  messageContainer.value.scrollTop = messageContainer.value.scrollHeight
}

const scheduleScrollToBottom = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToBottom()
    })
  })
}

const toTranscript = (): InterviewTranscriptItem[] => {
  return messages.value.map(item => ({
    role: item.role,
    content: item.content
  }))
}

const appendAssistantMessage = (
  content: string,
  kind: InterviewMessageKind,
  options?: { scoreDelta?: number; scoreReason?: string }
) => {
  messages.value.push({
    id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'assistant',
    kind,
    content: content.trim(),
    scoreDelta: options?.scoreDelta,
    scoreReason: options?.scoreReason
  })
  scheduleScrollToBottom()
}

const appendUserMessage = (content: string) => {
  messages.value.push({
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role: 'user',
    kind: 'analysis',
    content: content.trim()
  })
  scheduleScrollToBottom()
}

const clampScore = (score: number): number => {
  return Math.max(0, Math.min(100, Math.round(score)))
}

const onMarkdownFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) {
    return
  }
  try {
    markdownContent.value = await file.text()
    errorMessage.value = null
  } catch {
    errorMessage.value = '读取文件失败，请重试。'
  }
}

const loadProfileDefaults = async () => {
  try {
    const response = await ApiService.getUserProfile()
    if (!response.success || !response.data) {
      return
    }

    preferredProviderId.value = response.data.preferredProviderConfigId || ''

    if (!targetRole.value && response.data.interviewProfile?.targetRole) {
      targetRole.value = response.data.interviewProfile.targetRole
    }

    if (!markdownContent.value.trim() && response.data.interviewProfile?.selfIntroduction) {
      const focusDirection = response.data.interviewProfile.focusDirection || '无'
      markdownContent.value = [
        '# 个人面试资料',
        '',
        '## 自我介绍',
        response.data.interviewProfile.selfIntroduction,
        '',
        '## 面试关注方向',
        focusDirection
      ].join('\n')
    }
  } catch {
    // 个人信息非必需，不阻断面试页面使用
  }
}

const startInterview = async () => {
  if (!canStartInterview.value || !selectedProviderId.value) {
    return
  }

  isStarting.value = true
  errorMessage.value = null
  messages.value = []
  totalScore.value = 60

  try {
    const response = await ApiService.startInterview({
      providerConfigId: selectedProviderId.value,
      markdown: markdownContent.value.trim(),
      targetRole: targetRole.value.trim() || undefined
    })

    if (!response.success || !response.data?.question) {
      throw new Error(response.error || '开始面试辅导失败')
    }

    appendAssistantMessage(response.data.question, 'question')
    await nextTick()
    scheduleScrollToBottom()
    speakQuestion(response.data.question)
  } catch (error) {
    errorMessage.value = normalizeError(error, '开始面试辅导失败，请稍后重试。')
  } finally {
    isStarting.value = false
  }
}

const submitAnswer = async () => {
  if (!answerInput.value.trim() || !selectedProviderId.value || !messages.value.length) {
    return
  }

  const answer = answerInput.value.trim()
  answerInput.value = ''
  appendUserMessage(answer)
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const response = await ApiService.submitInterviewAnswer({
      providerConfigId: selectedProviderId.value,
      markdown: markdownContent.value.trim(),
      targetRole: targetRole.value.trim() || undefined,
      transcript: toTranscript(),
      answer
    })

    if (!response.success || !response.data?.nextQuestion || !response.data.analysis) {
      throw new Error(response.error || '提交回答失败')
    }

    const scoreDelta = Number.isFinite(response.data.scoreDelta) ? response.data.scoreDelta : 0
    totalScore.value = clampScore(totalScore.value + scoreDelta)

    appendAssistantMessage(response.data.analysis, 'analysis', {
      scoreDelta,
      scoreReason: response.data.scoreReason || '本轮无额外说明'
    })
    appendAssistantMessage(response.data.nextQuestion, 'question')
    await nextTick()
    scheduleScrollToBottom()
    speakQuestion(response.data.nextQuestion)
  } catch (error) {
    errorMessage.value = normalizeError(error, '提交回答失败，请稍后重试。')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await providerStore.fetchProviders()
  await loadProfileDefaults()
  const synth = getSpeechSynthesis()
  if (synth) {
    loadVoices()
    synth.onvoiceschanged = () => {
      loadVoices()
    }
  }
})

watch(
  () => messages.value.length,
  () => {
    scheduleScrollToBottom()
  }
)

watch(isSubmitting, () => {
  scheduleScrollToBottom()
})

onBeforeUnmount(() => {
  stopSpeaking()
  const synth = getSpeechSynthesis()
  if (synth) {
    synth.onvoiceschanged = null
  }
})
</script>
