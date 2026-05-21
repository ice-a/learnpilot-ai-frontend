<template>
  <div class="learning-plan-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h1 :class="lowAgeMode ? 'text-4xl font-black text-gray-800' : 'text-3xl font-bold text-gray-800'">
            {{ lowAgeMode ? '🗺️ 学习地图' : '学习计划' }}
          </h1>

          <button
            class="inline-flex items-center gap-2 text-sm bg-white border rounded-full px-4 py-2 shadow-sm hover:bg-gray-50"
            @click="showPlanPreferences = !showPlanPreferences"
          >
            {{ showPlanPreferences ? '收起界面偏好' : '展开界面偏好' }}
          </button>
        </div>

        <div
          v-if="showKnowledgeRequiredNotice"
          class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          请先选择学习方向并点击“去学习”进入知识点辅导。
        </div>

        <div v-if="showPlanPreferences" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <label class="inline-flex items-center gap-2 text-sm bg-white border rounded-full px-4 py-2">
            <input v-model="lowAgeMode" type="checkbox" />
            低龄模式（大按钮 + 少文字）
          </label>
          <p class="text-xs text-gray-500 mt-2">默认隐藏界面偏好，避免首屏信息过多。</p>
        </div>

        <div :class="['bg-white rounded-lg shadow-md space-y-5', lowAgeMode ? 'p-7' : 'p-6']">
          <div class="space-y-2">
            <h2 :class="lowAgeMode ? 'text-2xl font-black text-gray-800' : 'text-xl font-semibold text-gray-800'">
              {{ lowAgeMode ? '1️⃣ 先选择学习方向' : '选择学习方向' }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                :class="trackType === 'k12' ? activeTrackClass : idleTrackClass"
                @click="trackType = 'k12'"
              >
                <div class="text-2xl">📘</div>
                <div class="text-left">
                  <div class="font-bold">K12 学科学习</div>
                  <div class="text-sm opacity-80">小学 / 初中 / 高中</div>
                </div>
              </button>
              <button
                :class="trackType === 'career' ? activeTrackClass : idleTrackClass"
                @click="trackType = 'career'"
              >
                <div class="text-2xl">💼</div>
                <div class="text-left">
                  <div class="font-bold">职业能力学习</div>
                  <div class="text-sm opacity-80">岗位 + 学习方向</div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="trackType === 'k12'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label :class="lowAgeMode ? 'block text-base font-bold text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'">
                年级阶段
              </label>
              <select v-model="selectedGradeStage" :class="selectClass">
                <option value="">请选择</option>
                <option value="primary">小学</option>
                <option value="junior">初中</option>
                <option value="senior">高中</option>
              </select>
            </div>

            <div>
              <label :class="lowAgeMode ? 'block text-base font-bold text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'">
                年级
              </label>
              <select v-model="selectedGradeLevel" :disabled="!selectedGradeStage" :class="selectClass">
                <option value="">请选择</option>
                <option v-for="level in gradeLevels" :key="level" :value="level">{{ level }} 年级</option>
              </select>
            </div>

            <div>
              <label :class="lowAgeMode ? 'block text-base font-bold text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'">
                学科
              </label>
              <select v-model="selectedSubject" :class="selectClass">
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
                :disabled="!canGenerate || knowledgeStore.isGenerating"
                @click="generateKnowledge"
              >
                {{ knowledgeStore.isGenerating ? '生成中...' : (lowAgeMode ? '✨ 生成学习卡片' : '生成知识点') }}
              </button>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label :class="lowAgeMode ? 'block text-base font-bold text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'">
                岗位（必填）
              </label>
              <input
                v-model="careerRole"
                :class="selectClass"
                maxlength="120"
                placeholder="例如：短视频运营、新媒体编辑、前端开发"
              />
            </div>

            <div>
              <label :class="lowAgeMode ? 'block text-base font-bold text-gray-700 mb-2' : 'block text-sm font-medium text-gray-700 mb-2'">
                学习方向（选填）
              </label>
              <input
                v-model="careerGoal"
                :class="selectClass"
                maxlength="240"
                placeholder="例如：3 个月达到可上岗"
              />
            </div>

            <div class="md:col-span-2">
              <button
                :class="[
                  'w-full text-white rounded-md disabled:bg-gray-400',
                  lowAgeMode ? 'bg-blue-600 text-lg font-bold px-5 py-3' : 'bg-blue-600 px-4 py-2'
                ]"
                :disabled="!canGenerate || knowledgeStore.isGenerating"
                @click="generateKnowledge"
              >
                {{ knowledgeStore.isGenerating ? '生成中...' : '生成职业学习路线' }}
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border border-indigo-100">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">面试辅导</h2>
              <p class="text-sm text-gray-600 mt-1">
                上传 Markdown 材料，AI 逐题提问，回答后即时分析并继续追问。
              </p>
            </div>
            <router-link
              :to="interviewRoute"
              class="inline-flex items-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-semibold"
            >
              进入面试辅导
            </router-link>
          </div>
        </div>

        <div v-if="knowledgeStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {{ knowledgeStore.error }}
        </div>

        <div v-if="knowledgeStore.knowledgePoints.length" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 :class="lowAgeMode ? 'text-2xl font-black text-gray-800' : 'text-xl font-semibold text-gray-800'">
              {{
                lowAgeMode
                  ? `2️⃣ 选一张卡片开始学习（${displayTotal}）`
                  : `知识点列表（${displayTotal}）`
              }}
            </h2>
            <button
              class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="showFilterPanel = !showFilterPanel"
            >
              {{ showFilterPanel ? '收起筛选' : `筛选与排序${activeFiltersCount ? `（${activeFiltersCount}）` : ''}` }}
            </button>
          </div>

          <div v-if="showFilterPanel" class="px-6 pb-4 border-b border-gray-100">
            <div class="flex flex-wrap gap-2">
              <select v-model="difficultyFilter" class="border rounded-md px-3 py-1 text-sm">
                <option value="">全部难度</option>
                <option v-for="i in 5" :key="i" :value="i">{{ i }} 级</option>
              </select>
              <select v-model="chapterFilter" class="border rounded-md px-3 py-1 text-sm">
                <option value="">全部章节</option>
                <option v-for="chapter in knowledgeStore.getChapters()" :key="chapter" :value="chapter">{{ chapter }}</option>
              </select>
              <button
                class="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 disabled:opacity-50"
                :disabled="activeFiltersCount === 0"
                @click="clearFilters"
              >
                清空筛选
              </button>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div
              v-for="point in filteredKnowledgePoints"
              :key="point._id"
              :class="['border border-gray-200 rounded-xl', lowAgeMode ? 'p-5' : 'p-4']"
            >
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="space-y-2 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {{ point.trackType === 'career' ? '职业方向' : 'K12 学科' }}
                    </span>
                    <span v-if="point.trackType === 'career' && point.careerRole" class="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      岗位：{{ point.careerRole }}
                    </span>
                    <span v-else class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {{ getK12Label(point) }}
                    </span>
                  </div>

                  <h3 :class="lowAgeMode ? 'text-2xl font-black text-gray-800' : 'text-lg font-semibold text-gray-800'">
                    {{ lowAgeMode ? `🧠 ${point.title}` : `${point.chapter} - ${point.title}` }}
                  </h3>
                  <p :class="lowAgeMode ? 'text-gray-700 text-lg leading-relaxed' : 'text-gray-600 mt-1'">
                    {{ lowAgeMode ? summarizeForKids(point.description) : point.description }}
                  </p>
                </div>

                <div class="text-right space-y-2 md:min-w-44">
                  <div :class="['text-xs px-2 py-1 rounded-full inline-block', getDifficultyClass(point.difficulty)]">
                    难度 {{ point.difficulty }}/5
                  </div>
                  <div class="text-xs text-gray-500">版本 v{{ point.version }}</div>
                  <button
                    :class="[
                      'w-full rounded-md text-white',
                      lowAgeMode
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-lg font-bold px-4 py-3'
                        : 'bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm'
                    ]"
                    @click="goLearn(point)"
                  >
                    {{ lowAgeMode ? '🚀 去学习' : '去学习' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredKnowledgePoints.length === 0" class="text-center text-gray-500 py-8">
              没有符合筛选条件的知识点
            </div>
          </div>
        </div>

        <div v-else-if="!knowledgeStore.isGenerating" class="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
          {{
            trackType === 'career'
              ? '先输入岗位，再生成职业学习路线'
              : (lowAgeMode ? '先选年级和学科，再点“生成学习卡片”' : '请选择年级和学科，然后生成知识点')
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKnowledgeStore } from '../../stores/knowledge'
import { useProviderStore } from '../../stores/provider'
import type { GradeStage, Subject, KnowledgePoint, LearningTrackType } from '../../types'

const knowledgeStore = useKnowledgeStore()
const providerStore = useProviderStore()
const router = useRouter()
const route = useRoute()

const trackType = ref<LearningTrackType>('k12')
const selectedGradeStage = ref<GradeStage | ''>('')
const selectedGradeLevel = ref<number | ''>('')
const selectedSubject = ref<Subject | ''>('')
const careerRole = ref('')
const careerGoal = ref('')

const difficultyFilter = ref<number | ''>('')
const chapterFilter = ref<string | ''>('')
const showPlanPreferences = ref(false)
const showFilterPanel = ref(false)

const lowAgeMode = ref(localStorage.getItem('ui.lowAgeMode') === '1')
watch(lowAgeMode, value => {
  localStorage.setItem('ui.lowAgeMode', value ? '1' : '0')
})

watch(trackType, value => {
  if (value === 'k12') {
    careerRole.value = ''
    careerGoal.value = ''
  } else {
    selectedGradeStage.value = ''
    selectedGradeLevel.value = ''
    selectedSubject.value = ''
  }
})

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

const selectClass = computed(() => {
  return lowAgeMode.value
    ? 'w-full border rounded-md px-3 py-3 text-lg font-semibold disabled:bg-gray-100'
    : 'w-full border rounded-md px-3 py-2 disabled:bg-gray-100'
})

const gradeLevels = computed(() => {
  switch (selectedGradeStage.value) {
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

const canGenerate = computed(() => {
  if (!providerStore.activeProvider?._id) {
    return false
  }

  if (trackType.value === 'career') {
    return careerRole.value.trim().length > 0
  }

  return !!(selectedGradeStage.value && selectedGradeLevel.value && selectedSubject.value)
})

const displayTotal = computed(() => {
  return knowledgeStore.total || knowledgeStore.knowledgePoints.length
})

const showKnowledgeRequiredNotice = computed(() => String(route.query.requiredKnowledge || '') === '1')

const interviewRoute = computed(() => {
  return {
    name: 'InterviewCoach',
    query: {
      role: trackType.value === 'career' ? careerRole.value.trim() : ''
    }
  }
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (difficultyFilter.value) {
    count += 1
  }
  if (chapterFilter.value) {
    count += 1
  }
  return count
})

const clearFilters = () => {
  difficultyFilter.value = ''
  chapterFilter.value = ''
}

const filteredKnowledgePoints = computed(() => {
  return knowledgeStore.knowledgePoints.filter(point => {
    const matchDifficulty = !difficultyFilter.value || point.difficulty === difficultyFilter.value
    const matchChapter = !chapterFilter.value || point.chapter === chapterFilter.value
    return matchDifficulty && matchChapter
  })
})

const generateKnowledge = async () => {
  if (!canGenerate.value || !providerStore.activeProvider?._id) {
    return
  }

  if (trackType.value === 'career') {
    await knowledgeStore.generateKnowledge({
      trackType: 'career',
      careerRole: careerRole.value.trim(),
      careerGoal: careerGoal.value.trim() || undefined,
      providerConfigId: providerStore.activeProvider._id
    })
    return
  }

  await knowledgeStore.generateKnowledge({
    trackType: 'k12',
    gradeStage: selectedGradeStage.value as GradeStage,
    gradeLevel: selectedGradeLevel.value as number,
    subject: selectedSubject.value as Subject,
    providerConfigId: providerStore.activeProvider._id
  })
}

const goLearn = (point: KnowledgePoint) => {
  const desc = (point.description || '').slice(0, 300)
  const isCareer = point.trackType === 'career'

  // Tutor 目前会话模型仍需年级和学科，职业计划进入辅导时使用通用会话兜底。
  const fallbackGradeStage: GradeStage = 'senior'
  const fallbackGradeLevel = 12
  const fallbackSubject: Subject = 'politics'

  const tutorQuery = {
    fromPlan: '1',
    trackType: point.trackType,
    gradeStage: String(point.gradeStage || (isCareer ? fallbackGradeStage : selectedGradeStage.value || '')),
    gradeLevel: String(point.gradeLevel || (isCareer ? fallbackGradeLevel : selectedGradeLevel.value || '')),
    subject: String(point.subject || (isCareer ? fallbackSubject : selectedSubject.value || '')),
    chapter: point.chapter,
    title: point.title,
    difficulty: String(point.difficulty || ''),
    description: desc,
    careerRole: point.careerRole || (isCareer ? careerRole.value.trim() : ''),
    careerGoal: point.careerGoal || (isCareer ? careerGoal.value.trim() : ''),
    lowAge: lowAgeMode.value ? '1' : '0'
  }

  localStorage.setItem('learning.latestKnowledgePoint', JSON.stringify(tutorQuery))

  void router.push({
    name: 'Tutor',
    query: tutorQuery
  })
}

const summarizeForKids = (text: string) => {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= 48) {
    return clean
  }
  return `${clean.slice(0, 48)}...`
}

const getDifficultyClass = (difficulty: number) => {
  const classes = [
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800'
  ]
  return classes[difficulty - 1] || 'bg-gray-100 text-gray-800'
}

const getK12Label = (point: KnowledgePoint) => {
  const stageNames: Record<GradeStage, string> = {
    primary: '小学',
    junior: '初中',
    senior: '高中'
  }
  const subjectNames: Record<Subject, string> = {
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

  if (!point.gradeStage || !point.gradeLevel || !point.subject) {
    return 'K12 计划'
  }

  return `${stageNames[point.gradeStage]} ${point.gradeLevel} 年级 · ${subjectNames[point.subject]}`
}

onMounted(() => {
  void providerStore.fetchProviders()
})
</script>
