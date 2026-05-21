<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">找回密码</h1>
        <p class="text-sm text-gray-500 mt-1">输入注册邮箱，系统会发送重置链接。</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input v-model="email" type="email" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 font-semibold disabled:bg-gray-400"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '发送中...' : '发送重置邮件' }}
        </button>
      </form>

      <div v-if="message" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
        {{ message }}
      </div>

      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {{ errorMessage }}
      </div>

      <router-link to="/auth/login" class="text-sm text-blue-600 hover:underline">返回登录</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const email = ref('')
const isSubmitting = ref(false)
const message = ref('')
const errorMessage = ref('')

const submit = async () => {
  isSubmitting.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    await authStore.requestPasswordReset(email.value)
    message.value = '如果邮箱存在，重置邮件已发送。'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送失败'
  } finally {
    isSubmitting.value = false
  }
}
</script>
