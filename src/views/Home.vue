<template>
  <div class="home-page min-h-screen bg-gradient-to-b from-cyan-50 via-white to-amber-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <header class="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-lg">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="space-y-2">
            <h1 :class="lowAgeMode ? 'text-4xl md:text-5xl font-black' : 'text-3xl md:text-4xl font-bold'">
              {{ lowAgeMode ? '🚀 AI 能力工坊' : 'AI 能力工坊' }}
            </h1>
            <p :class="lowAgeMode ? 'text-lg md:text-xl font-semibold text-sky-50' : 'text-base md:text-lg text-sky-50'">
              {{ lowAgeMode ? '先连模型，再点卡片开始。' : '让想法更快变成可执行成果。' }}
            </p>
          </div>

          <label class="inline-flex items-center gap-2 text-sm bg-white/90 text-slate-700 rounded-full px-4 py-2 shadow">
            <input v-model="lowAgeMode" type="checkbox" />
            低龄模式
          </label>
        </div>
      </header>

      <section class="rounded-2xl border shadow-sm p-5 md:p-6" :class="hasActiveProvider ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-800">使用指引（必读）</h2>
            <p class="text-sm text-slate-600 mt-1">必须先配置并激活 AI 提供商，才能使用路线生成和对话。</p>
          </div>
          <router-link
            to="/settings/providers"
            class="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold"
            :class="hasActiveProvider ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'"
          >
            {{ hasActiveProvider ? '查看模型配置' : '先去配置模型' }}
          </router-link>
        </div>

        <ol class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <li class="bg-white border border-slate-200 rounded-xl p-3">
            <div class="font-semibold text-slate-800">1. 配置模型</div>
            <div class="text-slate-600 mt-1">在“模型设置”添加 OpenAI 兼容提供商并激活。</div>
          </li>
          <li class="bg-white border border-slate-200 rounded-xl p-3">
            <div class="font-semibold text-slate-800">2. 生成路线</div>
            <div class="text-slate-600 mt-1">选择 K12 或职业方向，生成可执行路线。</div>
          </li>
          <li class="bg-white border border-slate-200 rounded-xl p-3">
            <div class="font-semibold text-slate-800">3. 进入对话</div>
            <div class="text-slate-600 mt-1">必须从知识点卡片进入辅导；也可进入面试辅导进行问答训练。</div>
          </li>
        </ol>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link :to="entry.to" v-for="entry in entries" :key="entry.to" class="block">
          <article
            :class="[
              'h-full rounded-2xl border shadow-sm hover:shadow-md transition-all',
              lowAgeMode ? 'p-6 bg-white border-slate-200' : 'p-5 bg-white border-slate-200'
            ]"
          >
            <div class="flex items-center gap-3 mb-3">
              <div :class="['rounded-xl w-14 h-14 flex items-center justify-center text-3xl', entry.iconBg]">
                {{ entry.icon }}
              </div>
              <div>
                <h2 :class="lowAgeMode ? 'text-2xl font-black text-slate-800' : 'text-xl font-semibold text-slate-800'">
                  {{ entry.title }}
                </h2>
                <p v-if="!lowAgeMode" class="text-sm text-slate-500">{{ entry.subtitle }}</p>
              </div>
            </div>

            <p :class="lowAgeMode ? 'text-base text-slate-700 font-medium' : 'text-sm text-slate-600'">
              {{ entry.description }}
            </p>

            <div class="mt-4">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                  entry.badgeClass
                ]"
              >
                {{ entry.badge }}
              </span>
            </div>
          </article>
        </router-link>
      </section>

      <section class="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 md:p-6">
        <button class="w-full flex items-center justify-between" @click="showSystemStatus = !showSystemStatus">
          <h3 :class="lowAgeMode ? 'text-2xl font-black text-slate-800' : 'text-xl font-semibold text-slate-800'">
            {{ lowAgeMode ? '📌 系统状态' : '系统状态（点击展开）' }}
          </h3>
          <span class="text-sm text-slate-500">{{ showSystemStatus ? '收起' : '展开' }}</span>
        </button>

        <div v-if="showSystemStatus" class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div class="text-sm text-slate-500">模型提供商</div>
            <div class="mt-1 text-lg font-bold text-slate-800">
              {{ providerStore.activeProvider ? providerStore.activeProvider.name : '未激活' }}
            </div>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div class="text-sm text-slate-500">知识点总数</div>
            <div class="mt-1 text-lg font-bold text-slate-800">{{ knowledgeStore.total }}</div>
          </div>

          <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div class="text-sm text-slate-500">活跃会话</div>
            <div class="mt-1 text-lg font-bold text-slate-800">{{ tutorStore.currentSession ? 1 : 0 }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useProviderStore } from '../stores/provider'
import { useKnowledgeStore } from '../stores/knowledge'
import { useTutorStore } from '../stores/tutor'
import { useAuthStore } from '../stores/auth'

const providerStore = useProviderStore()
const knowledgeStore = useKnowledgeStore()
const tutorStore = useTutorStore()
const authStore = useAuthStore()

const lowAgeMode = ref(localStorage.getItem('ui.lowAgeMode') === '1')
const showSystemStatus = ref(false)

watch(lowAgeMode, value => {
  localStorage.setItem('ui.lowAgeMode', value ? '1' : '0')
})

const hasActiveProvider = computed(() => !!providerStore.activeProvider)

const entries = computed(() => {
  if (lowAgeMode.value) {
    return [
      {
        to: '/learning/plan',
        icon: '🧭',
        iconBg: 'bg-emerald-100',
        title: '能力路线',
        subtitle: '选方向后开始',
        description: '生成一张张能力卡片，点进去直接开始。',
        badge: '去生成',
        badgeClass: 'bg-emerald-100 text-emerald-700'
      },
      {
        to: '/learning/interview',
        icon: '🎤',
        iconBg: 'bg-sky-100',
        title: '面试辅导',
        subtitle: '上传材料后提问',
        description: 'AI 提问并分析回答，支持免费语音朗读题目。',
        badge: '去训练',
        badgeClass: 'bg-sky-100 text-sky-700'
      },
      {
        to: '/settings/providers',
        icon: '⚙️',
        iconBg: 'bg-amber-100',
        title: '模型设置',
        subtitle: '先完成连接',
        description: '先连接并激活模型，才能开始使用。',
        badge: '去配置',
        badgeClass: 'bg-amber-100 text-amber-700'
      }
    ]
  }

  return [
    {
      to: '/learning/plan',
      icon: '🧭',
      iconBg: 'bg-emerald-100',
      title: '能力路线',
      subtitle: 'K12 + 职业双轨',
      description: '按年级学科或岗位方向生成能力路线。',
      badge: '生成路线',
      badgeClass: 'bg-emerald-100 text-emerald-700'
    },
    {
      to: '/learning/interview',
      icon: '🎤',
      iconBg: 'bg-sky-100',
      title: '面试辅导',
      subtitle: 'Markdown + 语音提问',
      description: '上传文档后进入面试对话，AI 持续追问并给分析。',
      badge: '开始训练',
      badgeClass: 'bg-sky-100 text-sky-700'
    },
    {
      to: '/settings/providers',
      icon: '🛠️',
      iconBg: 'bg-amber-100',
      title: '模型提供商设置',
      subtitle: '必须先配置',
      description: '连接 OpenAI 兼容提供商并激活。',
      badge: hasActiveProvider.value ? '已配置' : '立即配置',
      badgeClass: hasActiveProvider.value ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }
  ]
})

onMounted(() => {
  if (!authStore.token) {
    return
  }

  void authStore.fetchCurrentUser()
    .then(async () => {
      await Promise.allSettled([
        providerStore.fetchProviders(),
        knowledgeStore.fetchKnowledge({})
      ])
    })
    .catch(() => {})
})
</script>
