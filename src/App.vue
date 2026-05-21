<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useProviderStore } from './stores/provider'
import { useAuthStore } from './stores/auth'

const providerStore = useProviderStore()
const authStore = useAuthStore()
const router = useRouter()

const hasActiveProvider = computed(() => !!providerStore.activeProvider)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentDisplayName = computed(() => authStore.user?.displayName || '用户')

const handleLogout = async () => {
  authStore.logout()
  await router.replace('/auth/login')
}

onMounted(() => {
  if (authStore.token) {
    void authStore.fetchCurrentUser()
      .then(() => providerStore.fetchProviders())
      .catch(() => {})
  }
})
</script>

<template>
  <div id="app">
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16 gap-3">
          <div class="min-w-0">
            <router-link to="/" class="text-xl font-bold text-gray-800 truncate block">
              AI 能力工坊
            </router-link>
            <p class="text-xs text-gray-500 hidden md:block">让想法更快变成可执行成果</p>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden lg:flex space-x-5">
              <router-link
                to="/"
                class="text-gray-600 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-medium"
              >
                首页
              </router-link>
              <router-link
                to="/learning/plan"
                class="text-gray-600 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-medium"
              >
                路线
              </router-link>
              <router-link
                to="/learning/interview"
                class="text-gray-600 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-medium"
              >
                面试辅导
              </router-link>
              <router-link
                to="/settings/providers"
                class="text-gray-600 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-medium"
              >
                模型设置
              </router-link>
              <router-link
                to="/profile"
                class="text-gray-600 hover:text-blue-600 transition-colors"
                active-class="text-blue-600 font-medium"
              >
                个人中心
              </router-link>
            </div>

            <div class="flex items-center gap-2">
              <router-link
                v-if="!isAuthenticated"
                to="/auth/login"
                class="text-xs px-3 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200"
              >
                登录 / 注册
              </router-link>
              <template v-else>
                <router-link
                  to="/profile"
                  class="text-xs px-3 py-1.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                >
                  {{ currentDisplayName }}
                </router-link>
                <router-link
                  to="/settings/providers"
                  :class="[
                    'text-xs px-3 py-1.5 rounded-full border',
                    hasActiveProvider
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  ]"
                >
                  {{ hasActiveProvider ? `已连接：${providerStore.activeProvider?.name}` : '未配置模型，点击设置' }}
                </router-link>
                <button
                  class="text-xs px-3 py-1.5 rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  @click="handleLogout"
                >
                  退出
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="min-h-screen bg-gray-50">
      <RouterView />
    </main>

    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-gray-600 text-sm">
          © 2026 AI 能力工坊 · 让想法更快变成可执行成果。
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
.router-link-active {
  @apply text-blue-600 font-medium;
}

.router-link-exact-active {
  @apply text-blue-600 font-medium;
}
</style>
