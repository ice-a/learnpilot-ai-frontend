<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">账号解锁验证</h1>
        <p class="text-sm text-gray-500 mt-1">当登录频率异常时，需要邮箱验证后继续登录。</p>
      </div>

      <form class="space-y-4" @submit.prevent="submitVerify">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input v-model="email" type="email" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">验证令牌</label>
          <input v-model="token" type="text" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <button
          type="submit"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-4 py-2 font-semibold disabled:bg-gray-400"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '验证中...' : '验证并解锁' }}
        </button>
      </form>

      <button
        class="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
        :disabled="isRequesting"
        @click="requestEmail"
      >
        {{ isRequesting ? '发送中...' : '重新发送解锁邮件' }}
      </button>

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
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const isSubmitting = ref(false)
const isRequesting = ref(false)
const message = ref('')
const errorMessage = ref('')

const submitVerify = async () => {
  isSubmitting.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    await authStore.verifyUnlock({
      email: email.value,
      token: token.value
    })
    message.value = '账号已解锁，请返回登录。'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '验证失败'
  } finally {
    isSubmitting.value = false
  }
}

const requestEmail = async () => {
  isRequesting.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    await authStore.requestUnlockEmail(email.value)
    message.value = '如果账号被锁定，验证邮件已发送。'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送失败'
  } finally {
    isRequesting.value = false
  }
}
</script>
