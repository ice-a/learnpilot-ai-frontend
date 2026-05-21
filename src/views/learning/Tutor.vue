<template>
  <div class="tutor-page" :class="lowAgeMode ? 'bg-sky-50 min-h-screen' : ''">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 :class="lowAgeMode ? 'text-4xl font-black text-gray-800' : 'text-3xl font-bold text-gray-800'">
            {{ lowAgeMode ? '🎧 语音辅导' : 'AI 辅导' }}
          </h1>

          <label class="inline-flex items-center gap-2 text-sm bg-white border rounded-full px-4 py-2 shadow-sm">
            <input v-model="lowAgeMode" type="checkbox" />
            低龄模式（大按钮 + 少文字 + 图标）
          </label>
        </div>

        <div v-if="planTarget" class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div class="font-bold text-amber-900">🎯 来自学习计划：{{ planTarget.title }}</div>
          <div class="text-sm text-amber-800">
            <template v-if="planTarget.trackType === 'career'">
              职业方向
              <span v-if="planTarget.careerRole"> · 岗位 {{ planTarget.careerRole }}</span>
              <span v-if="planTarget.careerGoal"> · 目标 {{ planTarget.careerGoal }}</span>
            </template>
            <template v-else>
              {{ planTarget.chapter }}
              <span v-if="planTarget.difficulty"> · 难度 {{ planTarget.difficulty }}/5</span>
            </template>
          </div>
          <div class="text-sm text-amber-900">{{ planTarget.description }}</div>
          <div class="flex gap-2">
            <button
              class="bg-amber-500 hover:bg-amber-600 text-white rounded-md px-4 py-2 font-semibold"
              :disabled="tutorStore.isLoading"
              @click="startPlanLearning"
            >
              {{ lowAgeMode ? '🚀 开始学这个知识点' : '按这个知识点开始学习' }}
            </button>
          </div>
        </div>

        <div v-if="!tutorStore.currentSession" class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 :class="lowAgeMode ? 'text-2xl font-black text-gray-800' : 'text-xl font-semibold text-gray-800'">
            {{ lowAgeMode ? '1️⃣ 选择学习方向并开始' : '开始新的辅导会话' }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button :class="sessionForm.trackType === 'k12' ? activeTrackClass : idleTrackClass" @click="setSessionTrack('k12')">
              <div class="text-2xl">📘</div>
              <div class="text-left">
                <div class="font-bold">K12 学科学习</div>
                <div class="text-sm opacity-80">按年级与学科辅导</div>
              </div>
            </button>
            <button :class="sessionForm.trackType === 'career' ? activeTrackClass : idleTrackClass" @click="setSessionTrack('career')">
              <div class="text-2xl">💼</div>
              <div class="text-left">
                <div class="font-bold">职业方向学习</div>
                <div class="text-sm opacity-80">按岗位与目标辅导</div>
              </div>
            </button>
          </div>

          <div v-if="sessionForm.trackType === 'k12'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label :class="labelClass">年级阶段</label>
              <select v-model="sessionForm.gradeStage" :class="selectClass">
                <option value="">请选择</option>
                <option value="primary">小学</option>
                <option value="junior">初中</option>
                <option value="senior">高中</option>
              </select>
            </div>

            <div>
              <label :class="labelClass">年级</label>
              <select v-model="sessionForm.gradeLevel" :disabled="!sessionForm.gradeStage" :class="selectClass">
                <option value="">请选择</option>
                <option v-for="level in gradeLevels" :key="level" :value="level">{{ level }} 年级</option>
              </select>
            </div>

            <div>
              <label :class="labelClass">学科</label>
              <select v-model="sessionForm.subject" :class="selectClass">
                <option value="">请选择</option>
                <option value="math">数学</option>
                <option value="chinese">语文</option>
                <option value="english">英语</option>
                <option value="physics">物理</option>
                <option value="chemistry">化学</option>
                <option value="biology">生物</option>
                <option value="history">历史</option>
                <option value="geography">地理</option>
                <option value="politics">政治</option>
              </select>
            </div>

            <div class="flex items-end">
              <button
                :class="[
                  'w-full text-white rounded-md disabled:bg-gray-400',
                  lowAgeMode ? 'bg-blue-600 text-lg font-bold px-5 py-3' : 'bg-blue-600 px-4 py-2'
                ]"
                :disabled="!canCreateSession || tutorStore.isLoading"
                @click="createSession"
              >
                {{ tutorStore.isLoading ? '创建中...' : (lowAgeMode ? '🎉 开始学习' : '开始辅导') }}
              </button>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label :class="labelClass">岗位（必填）</label>
              <input v-model="sessionForm.careerRole" :class="selectClass" maxlength="120" placeholder="例如：新媒体运营、前端开发" />
            </div>
            <div>
              <label :class="labelClass">学习目标（选填）</label>
              <input v-model="sessionForm.careerGoal" :class="selectClass" maxlength="240" placeholder="例如：2 个月具备独立上岗能力" />
            </div>
            <div class="md:col-span-2">
              <button
                :class="[
                  'w-full text-white rounded-md disabled:bg-gray-400',
                  lowAgeMode ? 'bg-blue-600 text-lg font-bold px-5 py-3' : 'bg-blue-600 px-4 py-2'
                ]"
                :disabled="!canCreateSession || tutorStore.isLoading"
                @click="createSession"
              >
                {{ tutorStore.isLoading ? '创建中...' : '开始职业辅导' }}
              </button>
            </div>
          </div>

          <div v-if="recentSessions.length" class="pt-4 border-t border-gray-200">
            <h3 :class="lowAgeMode ? 'text-xl font-black text-gray-800 mb-3' : 'text-lg font-medium text-gray-800 mb-3'">最近会话</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="session in recentSessions"
                :key="session._id"
                class="text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                @click="loadSession(session)"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span :class="session.trackType === 'career' ? 'text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700' : 'text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700'">
                    {{ session.trackType === 'career' ? '职业' : 'K12' }}
                  </span>
                  <div class="font-medium text-gray-800">{{ getSessionTitle(session) }}</div>
                </div>
                <div class="text-sm text-gray-500 mt-1">{{ formatDate(session.createdAt) }}</div>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span :class="tutorStore.currentSession.trackType === 'career' ? 'text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700' : 'text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700'">
                  {{ tutorStore.currentSession.trackType === 'career' ? '职业会话' : 'K12 会话' }}
                </span>
              </div>
              <h2 :class="lowAgeMode ? 'text-2xl font-black text-gray-800' : 'text-xl font-semibold text-gray-800'">
                {{ getSessionTitle(tutorStore.currentSession) }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">{{ getSessionSubtitle(tutorStore.currentSession) }}</p>
              <p v-if="!lowAgeMode" class="text-xs text-gray-400 mt-1">会话 ID：{{ tutorStore.currentSession._id }}</p>
            </div>
            <div class="flex gap-2">
              <button :class="lowAgeMode ? 'px-4 py-2 border border-gray-300 rounded-md text-base font-semibold' : 'px-3 py-1 border border-gray-300 rounded-md text-sm'" @click="clearMessages">
                {{ lowAgeMode ? '🧹 清空' : '清空对话' }}
              </button>
              <button :class="lowAgeMode ? 'px-4 py-2 bg-red-600 text-white rounded-md text-base font-semibold' : 'px-3 py-1 bg-red-600 text-white rounded-md text-sm'" @click="endSession">
                {{ lowAgeMode ? '⏹ 结束' : '结束会话' }}
              </button>
            </div>
          </div>

          <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <button class="w-full flex items-center justify-between" @click="showSpeechSettings = !showSpeechSettings">
              <span class="text-sm font-semibold text-gray-800">语音设置（免费 TTS）</span>
              <span class="text-xs text-gray-500">{{ showSpeechSettings ? '收起' : '展开' }}</span>
            </button>

            <div v-if="showSpeechSettings" class="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <label class="inline-flex items-center gap-2">
                <input v-model="ttsEnabled" type="checkbox" />
                开启语音朗读
              </label>

              <label class="inline-flex items-center gap-2">
                <input v-model="autoSpeakAssistant" type="checkbox" :disabled="!ttsEnabled" />
                自动朗读 AI 回复
              </label>

              <select v-model="selectedVoiceURI" class="border rounded-md px-2 py-1 max-w-xs" :disabled="!ttsEnabled">
                <option value="">系统默认音色</option>
                <option v-for="voice in availableVoices" :key="voice.voiceURI" :value="voice.voiceURI">
                  {{ voice.name }}（{{ voice.lang }}）
                </option>
              </select>

              <button class="px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100" :disabled="!isSpeaking" @click="stopSpeaking">
                停止朗读
              </button>
            </div>
          </div>

          <div class="px-6 py-3 border-b border-gray-200 bg-indigo-50">
            <button class="w-full flex items-center justify-between" @click="showReadingModePanel = !showReadingModePanel">
              <span class="text-sm font-semibold text-indigo-700">🪄 朗读模式</span>
              <span class="text-xs text-indigo-600">{{ showReadingModePanel ? '收起' : '展开' }}</span>
            </button>

            <div v-if="showReadingModePanel" class="mt-3">
              <div class="flex flex-wrap gap-2">
                <button :class="readingMode === 'normal' ? modeActiveClass : modeIdleClass" @click="setReadingMode('normal')">普通</button>
                <button :class="readingMode === 'dictation' ? modeActiveClass : modeIdleClass" @click="setReadingMode('dictation')">听写模式</button>
                <button :class="readingMode === 'shadowing' ? modeActiveClass : modeIdleClass" @click="setReadingMode('shadowing')">跟读模式</button>
              </div>
              <p class="text-xs text-indigo-700 mt-2">{{ readingModeHint }}</p>
            </div>
          </div>

          <div v-if="showQuickActions" class="px-6 py-3 border-b border-gray-200 bg-indigo-50">
            <div class="text-sm font-semibold text-indigo-700 mb-2">{{ quickActionTitle }}</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="action in activeQuickActions"
                :key="action.label"
                class="bg-white border border-indigo-200 rounded-full px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                :disabled="tutorStore.isLoading"
                @click="sendQuickPrompt(action.prompt)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <div v-if="readingMode === 'shadowing' && waitingShadowConfirm" class="px-6 py-3 border-b border-emerald-200 bg-emerald-50 flex flex-wrap items-center justify-between gap-2">
            <div class="text-sm text-emerald-700 font-semibold">🎤 请先跟读当前句，读完再点下一句</div>
            <button class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-3 py-2 text-sm font-semibold" @click="continueShadowing">
              我读完了，下一句
            </button>
          </div>

          <div ref="messagesContainer" class="chat-panel h-[32rem] overflow-y-auto p-5 md:p-6 space-y-4 bg-slate-50">
            <div v-if="!tutorStore.messages.length" :class="lowAgeMode ? 'text-center text-gray-500 py-8 text-lg' : 'text-center text-gray-500 py-8'">
              {{ lowAgeMode ? '👋 我准备好了，问我问题吧！' : '开始对话吧，请输入你的问题。' }}
            </div>

            <div v-for="message in tutorStore.messages" :key="message._id" :class="['chat-row', message.role === 'user' ? 'chat-row-user' : 'chat-row-ai']">
              <div v-if="message.role !== 'user'" class="chat-avatar chat-avatar-ai">AI</div>

              <div :class="['chat-bubble', message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai', lowAgeMode ? 'chat-bubble-large' : '']">
                <div v-if="message.role === 'assistant' && isHighlightingMessage(message._id)">
                  <p
                    v-for="(segment, segmentIndex) in currentSpeechSegments"
                    :key="`${message._id || 'msg'}-${segmentIndex}`"
                    :class="[
                      'whitespace-pre-wrap rounded-md px-2 py-1 transition-colors',
                      segmentIndex === currentSpeechIndex
                        ? 'bg-yellow-200 text-gray-900 font-semibold'
                        : 'text-gray-700'
                    ]"
                  >
                    {{ segment }}
                  </p>
                </div>

                <div v-else-if="message.role === 'assistant'" class="assistant-readable space-y-3">
                  <article
                    v-for="(cardHtml, cardIndex) in renderAssistantCards(getAssistantDisplayContent(message))"
                    :key="`${message._id || 'msg'}-card-${cardIndex}`"
                    class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                  >
                    <div class="assistant-markdown" v-html="cardHtml"></div>
                  </article>
                  <div v-if="isTypingMessage(message._id)" class="typing-cursor">▍</div>
                </div>

                <p v-else class="whitespace-pre-wrap">{{ message.content }}</p>

                <div class="mt-2 flex items-center justify-between gap-2">
                  <button
                    v-if="message.role === 'assistant'"
                    class="text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                    @click="speakText(message.content, message._id)"
                  >
                    {{ speakingMessageId === (message._id || '') ? '朗读中...' : '朗读' }}
                  </button>
                  <div v-else></div>
                  <p :class="['text-xs', message.role === 'user' ? 'text-blue-100' : 'text-gray-500']">{{ tutorStore.formatMessageTime(message.createdAt) }}</p>
                </div>
              </div>

              <div v-if="message.role === 'user'" class="chat-avatar chat-avatar-user">我</div>
            </div>

            <div v-if="tutorStore.isLoading" :class="lowAgeMode ? 'text-base text-gray-500' : 'text-sm text-gray-500'">
              {{ lowAgeMode ? '🤔 AI 正在思考...' : 'AI 正在思考...' }}
            </div>
          </div>

          <form class="p-5 md:p-6 border-t border-gray-200 flex gap-3 bg-white" @submit.prevent="sendMessage">
            <textarea
              v-model="inputMessage"
              rows="3"
              :class="[
                'flex-1 border rounded-xl',
                lowAgeMode ? 'px-4 py-3 text-lg font-medium' : 'px-3 py-2'
              ]"
              :placeholder="lowAgeMode ? '想问什么？可以直接说“我不会这个题”' : '输入你的问题...'"
              :disabled="tutorStore.isLoading"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              type="submit"
              :class="[
                'text-white rounded-xl self-end disabled:bg-gray-400',
                lowAgeMode ? 'bg-blue-600 text-lg font-bold px-6 py-3' : 'bg-blue-600 px-5 py-2'
              ]"
              :disabled="!inputMessage.trim() || tutorStore.isLoading"
            >
              {{ lowAgeMode ? '🚀 发送' : '发送' }}
            </button>
          </form>
        </div>

        <div v-if="displayError" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {{ displayError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTutorStore } from '../../stores/tutor'
import { useProviderStore } from '../../stores/provider'
import type { GradeStage, Subject, TutorSession, LearningTrackType } from '../../types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

type ReadingMode = 'normal' | 'dictation' | 'shadowing'

type PlanTarget = {
  trackType: LearningTrackType
  gradeStage?: GradeStage
  gradeLevel?: number
  subject?: Subject
  chapter: string
  title: string
  description: string
  difficulty?: number
  careerRole?: string
  careerGoal?: string
}

const tutorStore = useTutorStore()
const providerStore = useProviderStore()
const route = useRoute()

const lowAgeMode = ref(localStorage.getItem('ui.lowAgeMode') === '1')
const localError = ref<string | null>(null)
const planTarget = ref<PlanTarget | null>(null)

const sessionForm = ref({
  trackType: 'k12' as LearningTrackType,
  gradeStage: '' as GradeStage | '',
  gradeLevel: '' as number | '',
  subject: '' as Subject | '',
  careerRole: '',
  careerGoal: ''
})

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const ttsEnabled = ref(localStorage.getItem('ui.ttsEnabled') === '1')
const autoSpeakAssistant = ref(ttsEnabled.value && localStorage.getItem('ui.autoSpeakAssistant') === '1')
const availableVoices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceURI = ref('')
const speakingMessageId = ref<string | null>(null)
const speakRunId = ref(0)
const readingMode = ref<ReadingMode>((localStorage.getItem('ui.readingMode') as ReadingMode) || 'normal')
const showSpeechSettings = ref(localStorage.getItem('ui.showSpeechSettings') === '1')
const showReadingModePanel = ref(localStorage.getItem('ui.showReadingModePanel') === '1')
const waitingShadowConfirm = ref(false)
const currentSpeechSegments = ref<string[]>([])
const currentSpeechIndex = ref(-1)
const highlightedMessageId = ref<string | null>(null)
const shadowNextHandler = ref<(() => void) | null>(null)
const markdownCardCache = new Map<string, string[]>()
const typingTextMap = ref<Record<string, string>>({})
const typingMessageId = ref<string | null>(null)
const typingTimerId = ref<number | null>(null)
const pendingAssistantAnimation = ref(false)

marked.setOptions({ gfm: true, breaks: true })

type QuickAction = {
  label: string
  prompt: string
}

const kidQuickActions: QuickAction[] = [
  { label: '😊 再简单一点', prompt: '请你再讲简单一点，每句不超过 20 个字。' },
  { label: '🍎 生活例子', prompt: '请用生活中的例子讲这个知识点。' },
  { label: '🧩 出一道小题', prompt: '请给我出 1 道同类型小题，并给提示，不直接给答案。' },
  { label: '🔁 再说一遍', prompt: '请再讲一遍刚才的重点。' }
]

const currentTrackType = computed<LearningTrackType>(() => {
  if (tutorStore.currentSession?.trackType) {
    return tutorStore.currentSession.trackType
  }
  if (planTarget.value?.trackType) {
    return planTarget.value.trackType
  }
  return sessionForm.value.trackType
})

const isCareerContext = computed(() => currentTrackType.value === 'career')

const currentCareerRole = computed(() => {
  return (
    tutorStore.currentSession?.careerRole ||
    planTarget.value?.careerRole ||
    sessionForm.value.careerRole ||
    '当前岗位'
  ).trim()
})

const careerQuickActions = computed<QuickAction[]>(() => {
  const role = currentCareerRole.value
  return [
    {
      label: '🛠 实战任务',
      prompt: `请给我一个适合“${role}”的实战任务，包含目标、步骤、交付物和验收标准。`
    },
    {
      label: '🎤 面试点评',
      prompt: `我准备“${role}”面试，请按面试标准点评我刚才的回答，给出优点、问题和改进建议。`
    },
    {
      label: '📋 模拟面试',
      prompt: `请你扮演“${role}”面试官，按初级到进阶顺序连续问我 5 个问题。`
    },
    {
      label: '🧾 简历表达',
      prompt: `请把当前学习内容转成“${role}”可用的简历项目描述，包含职责、行动、结果。`
    }
  ]
})

const showQuickActions = computed(() => lowAgeMode.value || isCareerContext.value)

const activeQuickActions = computed<QuickAction[]>(() => {
  return isCareerContext.value ? careerQuickActions.value : kidQuickActions
})

const quickActionTitle = computed(() => {
  if (isCareerContext.value) {
    return `💼 岗位快捷提问（${currentCareerRole.value}）`
  }
  return '🧸 快捷提问'
})

watch(lowAgeMode, value => {
  localStorage.setItem('ui.lowAgeMode', value ? '1' : '0')
})

watch(readingMode, value => {
  localStorage.setItem('ui.readingMode', value)
})

watch(showSpeechSettings, value => {
  localStorage.setItem('ui.showSpeechSettings', value ? '1' : '0')
})

watch(showReadingModePanel, value => {
  localStorage.setItem('ui.showReadingModePanel', value ? '1' : '0')
})

watch(ttsEnabled, enabled => {
  localStorage.setItem('ui.ttsEnabled', enabled ? '1' : '0')
  if (!enabled) {
    autoSpeakAssistant.value = false
    stopSpeaking()
  }
})

watch(autoSpeakAssistant, enabled => {
  localStorage.setItem('ui.autoSpeakAssistant', enabled ? '1' : '0')
})

const setSessionTrack = (track: LearningTrackType) => {
  sessionForm.value.trackType = track
}

const activeTrackClass = computed(() => {
  return lowAgeMode.value
    ? 'w-full flex items-center gap-3 border-2 border-blue-500 bg-blue-50 rounded-xl p-4 text-blue-700 text-lg font-bold'
    : 'w-full flex items-center gap-3 border-2 border-blue-500 bg-blue-50 rounded-xl p-4 text-blue-700'
})

const idleTrackClass = computed(() => {
  return lowAgeMode.value
    ? 'w-full flex items-center gap-3 border border-gray-200 rounded-xl p-4 text-gray-700 text-lg font-semibold hover:bg-gray-50'
    : 'w-full flex items-center gap-3 border border-gray-200 rounded-xl p-4 text-gray-700 hover:bg-gray-50'
})

const modeActiveClass = computed(() => {
  return lowAgeMode.value
    ? 'bg-indigo-600 text-white rounded-full px-4 py-2 text-sm font-bold'
    : 'bg-indigo-600 text-white rounded-full px-3 py-1 text-sm font-semibold'
})

const modeIdleClass = computed(() => {
  return lowAgeMode.value
    ? 'bg-white border border-indigo-200 text-indigo-700 rounded-full px-4 py-2 text-sm font-semibold hover:bg-indigo-100'
    : 'bg-white border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-sm hover:bg-indigo-100'
})

const readingModeHint = computed(() => {
  if (readingMode.value === 'dictation') {
    return '听写模式：每句读完会停顿，方便孩子写下来。'
  }
  if (readingMode.value === 'shadowing') {
    return '跟读模式：每句后等待“我读完了，下一句”。'
  }
  return '普通模式：连续分段朗读。'
})

const labelClass = computed(() => {
  return lowAgeMode.value
    ? 'block text-base font-bold text-gray-700 mb-2'
    : 'block text-sm font-medium text-gray-700 mb-2'
})

const selectClass = computed(() => {
  return lowAgeMode.value
    ? 'w-full border rounded-md px-3 py-3 text-lg font-semibold disabled:bg-gray-100'
    : 'w-full border rounded-md px-3 py-2 disabled:bg-gray-100'
})

const gradeLevels = computed(() => {
  switch (sessionForm.value.gradeStage) {
    case 'primary':
      return [1, 2, 3, 4, 5, 6]
    case 'junior':
      return [7, 8, 9]
    case 'senior':
      return [10, 11, 12]
    default:
      return []
  }
})

const canCreateSession = computed(() => {
  if (!providerStore.activeProvider?._id) {
    return false
  }

  if (sessionForm.value.trackType === 'career') {
    return sessionForm.value.careerRole.trim().length > 0
  }

  return !!(sessionForm.value.gradeStage && sessionForm.value.gradeLevel && sessionForm.value.subject)
})

const recentSessions = computed(() => tutorStore.getRecentSessions(4))
const isSpeaking = computed(() => speakingMessageId.value !== null)
const displayError = computed(() => localError.value || tutorStore.error)

const toErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback
}

const getUserId = (): string => {
  const key = 'tutor_user_id'
  let userId = localStorage.getItem(key)
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(key, userId)
  }
  return userId
}

const firstQueryString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return String(value[0] || '')
  }
  return typeof value === 'string' ? value : ''
}

const tutorEntryCacheKey = 'learning.latestKnowledgePoint'

const parsePlanTargetFromSource = (source: Record<string, unknown>): PlanTarget | null => {
  const title = firstQueryString(source.title).trim()
  const chapter = firstQueryString(source.chapter).trim()
  const description = firstQueryString(source.description).trim()
  const careerRole = firstQueryString(source.careerRole).trim()
  const careerGoal = firstQueryString(source.careerGoal).trim()

  if (!title && !description && !careerRole) {
    return null
  }

  const trackTypeRaw = firstQueryString(source.trackType)
  const trackType: LearningTrackType = trackTypeRaw === 'career' ? 'career' : 'k12'

  const gradeStageRaw = firstQueryString(source.gradeStage)
  const subjectRaw = firstQueryString(source.subject)
  const gradeLevelRaw = firstQueryString(source.gradeLevel)
  const difficultyRaw = firstQueryString(source.difficulty)

  const validStages: GradeStage[] = ['primary', 'junior', 'senior']
  const validSubjects: Subject[] = ['math', 'chinese', 'english', 'physics', 'chemistry', 'biology', 'history', 'geography', 'politics']

  const gradeStage = validStages.includes(gradeStageRaw as GradeStage) ? (gradeStageRaw as GradeStage) : undefined
  const subject = validSubjects.includes(subjectRaw as Subject) ? (subjectRaw as Subject) : undefined
  const gradeLevel = Number.parseInt(gradeLevelRaw, 10)
  const difficulty = Number.parseInt(difficultyRaw, 10)

  return {
    trackType,
    gradeStage,
    gradeLevel: Number.isFinite(gradeLevel) ? gradeLevel : undefined,
    subject,
    chapter: chapter || (trackType === 'career' ? '职业学习路径' : '学习知识点'),
    title: title || (careerRole ? `${careerRole} 学习` : '知识点学习'),
    description: description || title || careerRole || '请讲解这个知识点',
    difficulty: Number.isFinite(difficulty) ? difficulty : undefined,
    careerRole: careerRole || undefined,
    careerGoal: careerGoal || undefined
  }
}

const parsePlanTargetFromQuery = (): PlanTarget | null => {
  return parsePlanTargetFromSource(route.query as Record<string, unknown>)
}

const parsePlanTargetFromCache = (): PlanTarget | null => {
  try {
    const raw = localStorage.getItem(tutorEntryCacheKey)
    if (!raw) {
      return null
    }
    const cached = JSON.parse(raw) as Record<string, unknown>
    return parsePlanTargetFromSource(cached)
  } catch {
    return null
  }
}

const applyPlanTargetToForm = (target: PlanTarget | null) => {
  if (!target) {
    return
  }

  sessionForm.value.trackType = target.trackType

  if (target.trackType === 'career') {
    sessionForm.value.careerRole = target.careerRole || sessionForm.value.careerRole
    sessionForm.value.careerGoal = target.careerGoal || sessionForm.value.careerGoal
    return
  }

  if (target.gradeStage) {
    sessionForm.value.gradeStage = target.gradeStage
  }
  if (target.gradeLevel) {
    sessionForm.value.gradeLevel = target.gradeLevel
  }
  if (target.subject) {
    sessionForm.value.subject = target.subject
  }
}

const createSessionWithOptions = async (options?: { forceNew?: boolean; fetchExistingMessages?: boolean }) => {
  const forceNew = options?.forceNew === true
  const fetchExistingMessages = options?.fetchExistingMessages !== false

  localError.value = null

  if (!canCreateSession.value || !providerStore.activeProvider?._id) {
    localError.value = sessionForm.value.trackType === 'career'
      ? '请先激活模型，并填写岗位。'
      : '请先激活模型，并选择完整年级学科。'
    return
  }

  const userId = getUserId()

  try {
    if (sessionForm.value.trackType === 'career') {
      await tutorStore.createSession({
        userId,
        trackType: 'career',
        careerRole: sessionForm.value.careerRole.trim(),
        careerGoal: sessionForm.value.careerGoal.trim() || undefined,
        providerConfigId: providerStore.activeProvider._id,
        forceNew
      })
    } else {
      await tutorStore.createSession({
        userId,
        trackType: 'k12',
        gradeStage: sessionForm.value.gradeStage as GradeStage,
        gradeLevel: sessionForm.value.gradeLevel as number,
        subject: sessionForm.value.subject as Subject,
        providerConfigId: providerStore.activeProvider._id,
        forceNew
      })
    }

    pendingAssistantAnimation.value = false
    if (fetchExistingMessages) {
      await tutorStore.fetchMessages()
      cacheCurrentAssistantMessages()
    } else {
      typingTextMap.value = {}
      inputMessage.value = ''
      scrollToBottom()
    }
  } catch (error) {
    pendingAssistantAnimation.value = false
    localError.value = toErrorMessage(error, '创建会话失败，请稍后重试。')
  }
}

const createSession = async () => {
  await createSessionWithOptions()
}

const ensureSession = async (): Promise<boolean> => {
  if (tutorStore.currentSession) {
    return true
  }

  await createSession()
  return !!tutorStore.currentSession
}

const buildPlanPrompt = (target: PlanTarget): string => {
  if (target.trackType === 'career') {
    const modeHint = lowAgeMode.value
      ? '请像耐心教练一样，用短句分步骤讲解。'
      : '请按“核心概念 -> 实操步骤 -> 练习任务”结构讲解。'

    return [
      '请围绕下面职业学习主题开始讲解：',
      target.careerRole ? `岗位：${target.careerRole}` : '',
      target.careerGoal ? `目标：${target.careerGoal}` : '',
      `章节：${target.chapter}`,
      `主题：${target.title}`,
      `描述：${target.description}`,
      modeHint,
      '最后请给 1 个可执行的小练习，并给提示。'
    ].filter(Boolean).join('\n')
  }

  const modeHint = lowAgeMode.value
    ? '请用小朋友能听懂的话讲解，句子短一点，多鼓励，少术语。'
    : '请按概念、例子、练习的结构讲解。'

  return [
    '请围绕下面知识点开始讲解：',
    `章节：${target.chapter}`,
    `标题：${target.title}`,
    `描述：${target.description}`,
    target.difficulty ? `难度：${target.difficulty}/5` : '',
    modeHint,
    '最后请给 1 道小练习题，并给提示。'
  ].filter(Boolean).join('\n')
}

const startPlanLearning = async () => {
  if (!planTarget.value) {
    return
  }

  localError.value = null

  if (!providerStore.activeProvider?._id) {
    await providerStore.fetchProviders()
  }

  if (!providerStore.activeProvider?._id) {
    localError.value = '没有可用模型，请先到“提供商配置”激活一个模型。'
    return
  }

  applyPlanTargetToForm(planTarget.value)
  await createSessionWithOptions({
    forceNew: true,
    fetchExistingMessages: false
  })

  const ready = !!tutorStore.currentSession
  if (!ready) {
    return
  }

  pendingAssistantAnimation.value = true
  try {
    await tutorStore.sendMessage(buildPlanPrompt(planTarget.value))
    await nextTick()
    scrollToBottom()
  } catch (error) {
    pendingAssistantAnimation.value = false
    localError.value = toErrorMessage(error, '开始计划学习失败，请稍后重试。')
  }
}

const loadSession = async (session: TutorSession) => {
  if (!session._id) {
    return
  }

  localError.value = null
  pendingAssistantAnimation.value = false
  await tutorStore.getSession(session._id)
  await tutorStore.fetchMessages()
  cacheCurrentAssistantMessages()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || tutorStore.isLoading) {
    return
  }

  localError.value = null
  const message = inputMessage.value.trim()
  inputMessage.value = ''

  const ready = await ensureSession()
  if (!ready) {
    return
  }

  pendingAssistantAnimation.value = true
  try {
    await tutorStore.sendMessage(message)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    pendingAssistantAnimation.value = false
    localError.value = toErrorMessage(error, '发送消息失败，请稍后重试。')
  }
}

const sendQuickPrompt = async (prompt: string) => {
  if (tutorStore.isLoading) {
    return
  }

  localError.value = null
  const ready = await ensureSession()
  if (!ready) {
    return
  }

  pendingAssistantAnimation.value = true
  try {
    await tutorStore.sendMessage(prompt)
    await nextTick()
    scrollToBottom()
  } catch (error) {
    pendingAssistantAnimation.value = false
    localError.value = toErrorMessage(error, '发送快捷提问失败，请稍后重试。')
  }
}

const clearMessages = () => {
  if (window.confirm('确定要清空当前会话吗？')) {
    stopTypewriter()
    typingTextMap.value = {}
    pendingAssistantAnimation.value = false
    stopSpeaking()
    tutorStore.clearCurrentSession()
  }
}

const endSession = async () => {
  if (window.confirm('确定要结束当前会话吗？')) {
    stopTypewriter()
    typingTextMap.value = {}
    pendingAssistantAnimation.value = false
    stopSpeaking()
    await tutorStore.closeSession()
  }
}

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  })
}

const stopTypewriter = () => {
  if (typingTimerId.value !== null) {
    window.clearTimeout(typingTimerId.value)
    typingTimerId.value = null
  }
  typingMessageId.value = null
}

const getAssistantDisplayContent = (message: { _id?: string; role: string; content: string }) => {
  if (message.role !== 'assistant' || !message._id) {
    return message.content
  }
  return typingTextMap.value[message._id] ?? message.content
}

const isTypingMessage = (messageId?: string) => {
  return !!messageId && typingMessageId.value === messageId
}

const cacheCurrentAssistantMessages = () => {
  const nextMap: Record<string, string> = {}
  for (const message of tutorStore.messages) {
    if (message.role === 'assistant' && message._id) {
      nextMap[message._id] = message.content
    }
  }
  typingTextMap.value = nextMap
}

const runTypewriter = (messageId: string, fullText: string): Promise<void> => {
  stopTypewriter()
  typingMessageId.value = messageId
  typingTextMap.value[messageId] = ''

  return new Promise(resolve => {
    let index = 0
    const step = () => {
      if (typingMessageId.value !== messageId) {
        resolve()
        return
      }

      const remaining = fullText.length - index
      const stepSize = remaining > 800 ? 8 : remaining > 400 ? 6 : remaining > 180 ? 3 : 1
      index = Math.min(fullText.length, index + stepSize)
      typingTextMap.value[messageId] = fullText.slice(0, index)
      scrollToBottom()

      if (index >= fullText.length) {
        typingMessageId.value = null
        typingTimerId.value = null
        resolve()
        return
      }

      typingTimerId.value = window.setTimeout(step, lowAgeMode.value ? 24 : 16)
    }

    step()
  })
}

const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    return html
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}

const renderAssistantCards = (content: string): string[] => {
  const normalized = content.trim()
  if (!normalized) {
    return []
  }

  const cached = markdownCardCache.get(normalized)
  if (cached) {
    return cached
  }

  const tokens = marked.lexer(normalized)
  const tokenCards: unknown[][] = []
  let currentCard: unknown[] = []

  const pushCurrentCard = () => {
    if (currentCard.length > 0) {
      tokenCards.push(currentCard)
      currentCard = []
    }
  }

  for (const token of tokens) {
    const isSplitToken = token.type === 'hr' || (token.type === 'heading' && ((token as { depth?: number }).depth || 0) <= 2)
    if (isSplitToken) {
      pushCurrentCard()
      if (token.type !== 'hr') {
        currentCard.push(token)
      }
      continue
    }

    currentCard.push(token)
  }
  pushCurrentCard()

  if (tokenCards.length === 0) {
    tokenCards.push(tokens as unknown[])
  }

  const cards = tokenCards
    .map(card => sanitizeHtml(marked.parser(card as Parameters<typeof marked.parser>[0]).trim()))
    .filter(Boolean)

  if (cards.length === 0) {
    cards.push(sanitizeHtml(marked.parse(normalized) as string))
  }

  markdownCardCache.set(normalized, cards)
  return cards
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

const splitTextForTTS = (text: string): string[] => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) {
    return []
  }

  const maxLen = lowAgeMode.value ? 46 : 90
  const sentences = clean
    .replace(/\n+/g, '。')
    .split(/(?<=[。！？!?；;])/)
    .map(sentence => sentence.trim())
    .filter(Boolean)

  if (!sentences.length) {
    const chunks: string[] = []
    for (let i = 0; i < clean.length; i += maxLen) {
      chunks.push(clean.slice(i, i + maxLen))
    }
    return chunks
  }

  const segments: string[] = []
  let buffer = ''
  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (buffer) {
        segments.push(buffer)
        buffer = ''
      }
      for (let i = 0; i < sentence.length; i += maxLen) {
        segments.push(sentence.slice(i, i + maxLen))
      }
      continue
    }

    if ((buffer + sentence).length > maxLen) {
      if (buffer) {
        segments.push(buffer)
      }
      buffer = sentence
    } else {
      buffer += sentence
    }
  }

  if (buffer) {
    segments.push(buffer)
  }
  return segments
}

const clearSpeechUiState = () => {
  waitingShadowConfirm.value = false
  shadowNextHandler.value = null
  currentSpeechSegments.value = []
  currentSpeechIndex.value = -1
  highlightedMessageId.value = null
}

const stopSpeaking = () => {
  const synth = getSpeechSynthesis()
  speakRunId.value += 1
  speakingMessageId.value = null
  clearSpeechUiState()
  if (synth) {
    synth.cancel()
  }
}

const finishSpeaking = (runId: number) => {
  if (runId !== speakRunId.value) {
    return
  }
  speakingMessageId.value = null
  clearSpeechUiState()
}

const speakText = (text: string, messageId?: string) => {
  if (!ttsEnabled.value || !text.trim()) {
    return
  }

  const synth = getSpeechSynthesis()
  if (!synth) {
    localError.value = '当前浏览器不支持语音朗读。'
    return
  }

  const segments = splitTextForTTS(text)
  if (!segments.length) {
    return
  }

  stopSpeaking()
  const runId = ++speakRunId.value
  speakingMessageId.value = messageId || '__manual__'
  highlightedMessageId.value = messageId || null
  currentSpeechSegments.value = segments
  currentSpeechIndex.value = 0
  const voice = resolveVoice()

  const speakSegment = (index: number) => {
    if (runId !== speakRunId.value) {
      return
    }
    if (index >= segments.length) {
      finishSpeaking(runId)
      return
    }

    currentSpeechIndex.value = index
    const utterance = new SpeechSynthesisUtterance(segments[index])
    utterance.lang = 'zh-CN'
    if (readingMode.value === 'dictation') {
      utterance.rate = lowAgeMode.value ? 0.8 : 0.9
    } else if (readingMode.value === 'shadowing') {
      utterance.rate = lowAgeMode.value ? 0.85 : 0.95
    } else {
      utterance.rate = lowAgeMode.value ? 0.92 : 1
    }
    utterance.pitch = 1
    if (voice) {
      utterance.voice = voice
    }

    utterance.onend = () => {
      if (runId !== speakRunId.value) {
        return
      }

      const nextIndex = index + 1
      if (nextIndex >= segments.length) {
        finishSpeaking(runId)
        return
      }

      if (readingMode.value === 'shadowing') {
        waitingShadowConfirm.value = true
        shadowNextHandler.value = () => {
          waitingShadowConfirm.value = false
          shadowNextHandler.value = null
          speakSegment(nextIndex)
        }
        return
      }

      const pauseMs = readingMode.value === 'dictation' ? (lowAgeMode.value ? 2200 : 1600) : 120
      window.setTimeout(() => {
        speakSegment(nextIndex)
      }, pauseMs)
    }

    utterance.onerror = () => {
      finishSpeaking(runId)
    }

    synth.speak(utterance)
  }

  speakSegment(0)
}

const isHighlightingMessage = (messageId?: string) => {
  if (!messageId) {
    return false
  }
  return highlightedMessageId.value === messageId && currentSpeechSegments.value.length > 0
}

const continueShadowing = () => {
  if (!waitingShadowConfirm.value || !shadowNextHandler.value) {
    return
  }
  shadowNextHandler.value()
}

const setReadingMode = (mode: ReadingMode) => {
  readingMode.value = mode
}

watch(
  () => tutorStore.messages.length,
  (currentLength, previousLength) => {
    void nextTick().then(scrollToBottom)
    if (currentLength <= previousLength) {
      return
    }

    const latestMessage = tutorStore.messages[currentLength - 1]
    if (!latestMessage) {
      return
    }

    if (latestMessage.role !== 'assistant' || !latestMessage.content) {
      return
    }

    const shouldSpeak = ttsEnabled.value && autoSpeakAssistant.value
    const assistantId = latestMessage._id || `assistant_${Date.now()}`

    const handleAssistantMessage = async () => {
      if (pendingAssistantAnimation.value && latestMessage._id) {
        await runTypewriter(assistantId, latestMessage.content)
      } else if (latestMessage._id) {
        typingTextMap.value[assistantId] = latestMessage.content
      }

      pendingAssistantAnimation.value = false

      if (shouldSpeak) {
        speakText(latestMessage.content, latestMessage._id)
      }
    }

    void handleAssistantMessage()
  }
)

watch(
  () => tutorStore.currentSession?._id,
  () => {
    stopTypewriter()
    typingTextMap.value = {}
    pendingAssistantAnimation.value = false
  }
)

const getStageName = (stage?: GradeStage) => {
  if (!stage) {
    return '未知阶段'
  }
  const names: Record<GradeStage, string> = { primary: '小学', junior: '初中', senior: '高中' }
  return names[stage]
}

const getSubjectName = (subject?: Subject) => {
  if (!subject) {
    return '通用学科'
  }
  const names: Record<Subject, string> = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    physics: '物理',
    chemistry: '化学',
    biology: '生物',
    history: '历史',
    geography: '地理',
    politics: '政治'
  }
  return names[subject]
}

const getSessionTitle = (session: TutorSession): string => {
  if (session.trackType === 'career') {
    return session.careerRole ? `${session.careerRole} 学习辅导` : '职业学习辅导'
  }
  return `${getStageName(session.gradeStage)} ${session.gradeLevel || ''} 年级 ${getSubjectName(session.subject)}`.trim()
}

const getSessionSubtitle = (session: TutorSession): string => {
  if (session.trackType === 'career') {
    return session.careerGoal ? `目标：${session.careerGoal}` : '岗位能力提升路径'
  }
  return '按章节拆解知识点，逐步讲解 + 练习'
}

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return ''
  }
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(async () => {
  localError.value = null
  const queryLowAge = firstQueryString(route.query.lowAge)
  if (queryLowAge === '1') {
    lowAgeMode.value = true
  }

  const fromPlan = firstQueryString(route.query.fromPlan) === '1'
  if (fromPlan) {
    localStorage.setItem(tutorEntryCacheKey, JSON.stringify(route.query))
  }

  planTarget.value = parsePlanTargetFromQuery() || parsePlanTargetFromCache()
  applyPlanTargetToForm(planTarget.value)
  await providerStore.fetchProviders()
  await tutorStore.fetchUserSessions(getUserId())

  const synth = getSpeechSynthesis()
  if (synth) {
    loadVoices()
    synth.onvoiceschanged = () => {
      loadVoices()
    }
  }

  if (fromPlan && planTarget.value) {
    await startPlanLearning()
  }
})

onBeforeUnmount(() => {
  stopTypewriter()
  const synth = getSpeechSynthesis()
  if (synth) {
    synth.cancel()
    synth.onvoiceschanged = null
  }
  clearSpeechUiState()
})
</script>

<style scoped>
.chat-panel {
  background-image: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.chat-row {
  display: flex;
  gap: 0.65rem;
  align-items: flex-end;
}

.chat-row-ai {
  justify-content: flex-start;
}

.chat-row-user {
  justify-content: flex-end;
}

.chat-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.chat-avatar-ai {
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}

.chat-avatar-user {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.chat-bubble {
  max-width: min(85%, 52rem);
  border-radius: 1rem;
  padding: 0.75rem 0.9rem;
}

.chat-bubble-large {
  padding: 1rem 1.1rem;
}

.chat-bubble-ai {
  background: #f8fafc;
  border: 1px solid #dbe2ea;
  color: #1f2937;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.chat-bubble-user {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.22);
}

.typing-cursor {
  color: #2563eb;
  font-weight: 700;
  animation: typing-blink 0.9s steps(1, end) infinite;
}

@keyframes typing-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.assistant-markdown :deep(h1),
.assistant-markdown :deep(h2),
.assistant-markdown :deep(h3) {
  margin: 0.35rem 0 0.55rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}

.assistant-markdown :deep(h1) {
  font-size: 1.2rem;
}

.assistant-markdown :deep(h2) {
  font-size: 1.1rem;
}

.assistant-markdown :deep(h3) {
  font-size: 1rem;
}

.assistant-markdown :deep(p) {
  margin: 0.35rem 0;
  line-height: 1.75;
  color: #334155;
}

.assistant-markdown :deep(ul),
.assistant-markdown :deep(ol) {
  margin: 0.4rem 0;
  padding-left: 1.2rem;
  color: #334155;
}

.assistant-markdown :deep(li) {
  margin: 0.2rem 0;
  line-height: 1.7;
}

.assistant-markdown :deep(code) {
  background: #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.1rem 0.35rem;
  font-size: 0.85em;
  color: #0f172a;
}

.assistant-markdown :deep(pre) {
  background: #0f172a;
  border-radius: 0.5rem;
  padding: 0.7rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.assistant-markdown :deep(pre code) {
  background: transparent;
  color: #e2e8f0;
  padding: 0;
}

.assistant-markdown :deep(blockquote) {
  margin: 0.5rem 0;
  padding: 0.5rem 0.7rem;
  border-left: 4px solid #38bdf8;
  background: #f0f9ff;
  border-radius: 0.25rem;
  color: #0c4a6e;
}

.assistant-markdown :deep(a) {
  color: #0284c7;
  text-decoration: underline;
  word-break: break-all;
}

.assistant-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.92rem;
}

.assistant-markdown :deep(th),
.assistant-markdown :deep(td) {
  border: 1px solid #cbd5e1;
  padding: 0.35rem 0.5rem;
  text-align: left;
}

.assistant-markdown :deep(th) {
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
}
</style>
