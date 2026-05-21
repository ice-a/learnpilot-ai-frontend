<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">注册</h1>
        <p class="text-sm text-gray-500 mt-1">请使用可接收邮件的邮箱注册。</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
          <input v-model="displayName" type="text" maxlength="60" class="w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input v-model="email" type="email" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input v-model="password" type="password" minlength="8" class="w-full border rounded-md px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input v-model="confirmPassword" type="password" minlength="8" class="w-full border rounded-md px-3 py-2" required />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 font-semibold disabled:bg-gray-400"
          :disabled="authStore.isLoading"
        >
          {{ authStore.isLoading ? '注册中...' : '注册并登录' }}
        </button>
      </form>

      <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        {{ errorMessage }}
      </div>

      <div class="text-sm text-gray-600">
        已有账号？
        <router-link to="/auth/login" class="text-blue-600 hover:underline">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  try {
    await authStore.register({
      displayName: displayName.value,
      email: email.value,
      password: password.value
    })
    await router.replace('/learning/plan')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '注册失败'
  }
}
</script>
