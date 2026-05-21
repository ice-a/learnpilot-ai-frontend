<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">登录</h1>
        <p class="text-sm text-gray-500 mt-1">登录后可使用学习与面试辅导功能。</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input v-model="email" type="email" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input v-model="password" type="password" minlength="8" class="w-full border rounded-md px-3 py-2" required />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 font-semibold disabled:bg-gray-400"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {{ errorMessage }}
      </div>

      <div class="text-sm text-gray-600 flex flex-wrap items-center gap-3">
        <router-link to="/auth/register" class="text-blue-600 hover:underline">注册账号</router-link>
        <router-link to="/auth/forgot-password" class="text-blue-600 hover:underline">忘记密码</router-link>
        <router-link to="/auth/unlock" class="text-blue-600 hover:underline">账号解锁验证</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/learning/plan'
    await router.replace(redirect)
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    errorMessage.value = message
  }
}
</script>
