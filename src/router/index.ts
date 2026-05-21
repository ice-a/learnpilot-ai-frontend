import { createRouter, createWebHistory } from 'vue-router'
import { ApiService } from '../services/api'
import type { AIProvider } from '../types'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/auth/login',
      name: 'AuthLogin',
      component: () => import('../views/auth/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/auth/register',
      name: 'AuthRegister',
      component: () => import('../views/auth/Register.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/auth/forgot-password',
      name: 'AuthForgotPassword',
      component: () => import('../views/auth/ForgotPassword.vue'),
      meta: { title: '找回密码' }
    },
    {
      path: '/auth/reset-password',
      name: 'AuthResetPassword',
      component: () => import('../views/auth/ResetPassword.vue'),
      meta: { title: '重置密码' }
    },
    {
      path: '/auth/unlock',
      name: 'AuthUnlock',
      component: () => import('../views/auth/UnlockAccount.vue'),
      meta: { title: '账号解锁验证' }
    },
    {
      path: '/settings/providers',
      name: 'ProviderSettings',
      component: () => import('../views/settings/Providers.vue'),
      meta: { title: '模型提供商设置' }
    },
    {
      path: '/profile',
      name: 'UserProfile',
      component: () => import('../views/Profile.vue'),
      meta: { title: '个人中心' }
    },
    {
      path: '/learning/plan',
      name: 'LearningPlan',
      component: () => import('../views/learning/Plan.vue'),
      meta: { title: '能力路线' }
    },
    {
      path: '/learning/tutor',
      name: 'Tutor',
      component: () => import('../views/learning/Tutor.vue'),
      meta: { title: 'AI 对话工作台' }
    },
    {
      path: '/learning/interview',
      name: 'InterviewCoach',
      component: () => import('../views/learning/InterviewCoach.vue'),
      meta: { title: '面试辅导' }
    }
  ]
})

const providerRequiredRoutes = new Set(['LearningPlan', 'Tutor', 'InterviewCoach'])
const authPageRoutes = new Set(['AuthLogin', 'AuthRegister'])
const authRequiredRoutes = new Set(['ProviderSettings', 'UserProfile', 'LearningPlan', 'Tutor', 'InterviewCoach'])
const tutorEntryCacheKey = 'learning.latestKnowledgePoint'

router.beforeEach(async to => {
  const routeName = String(to.name || '')
  const token = localStorage.getItem('auth.token')

  if (authPageRoutes.has(routeName) && token) {
    return { name: 'Home' }
  }

  if (authRequiredRoutes.has(routeName) && !token) {
    return {
      name: 'AuthLogin',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (routeName === 'Tutor') {
    const fromPlan = String(to.query.fromPlan || '') === '1'
    const hasCachedKnowledgePoint = typeof window !== 'undefined' && !!window.localStorage.getItem(tutorEntryCacheKey)
    if (!fromPlan && !hasCachedKnowledgePoint) {
      return {
        name: 'LearningPlan',
        query: {
          requiredKnowledge: '1'
        }
      }
    }
  }

  if (!providerRequiredRoutes.has(routeName)) {
    return true
  }

  try {
    const response = await ApiService.getProviders()
    const providers = (response.data || []) as AIProvider[]
    const hasActiveProvider = providers.some(provider => provider.isActive)

    if (hasActiveProvider) {
      return true
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('未登录') || message.includes('过期')) {
      localStorage.removeItem('auth.token')
      localStorage.removeItem('auth.user')
      return {
        name: 'AuthLogin',
        query: {
          redirect: to.fullPath
        }
      }
    }
  }

  return {
    name: 'ProviderSettings',
    query: {
      requiredProvider: '1',
      redirect: to.fullPath
    }
  }
})

router.afterEach(to => {
  const pageTitle = typeof to.meta?.title === 'string' ? to.meta.title : 'AI 能力工坊'
  document.title = `${pageTitle} · AI 能力工坊`
})

export default router
