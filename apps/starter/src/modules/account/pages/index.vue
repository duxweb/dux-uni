<route lang="json">
{
  "title": "账户"
}
</route>

<script setup lang="ts">
import { useAuth, useAuthStore, useCheck, usePageTitle, useRouter, useThemePreference, useUniApp } from '@duxweb/uni'
import { computed, ref } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'
import { wrapAsyncEvent } from '@/utils/async'

const dux = useUniApp()
const toast = useToast()
const auth = useAuth()
const router = useRouter()
const authStore = useAuthStore()
const { themePreference, canSetThemePreference, systemTheme, cycleThemePreference } = useThemePreference()
const isLogin = computed(() => Boolean(auth.value?.token))
const checkAction = useCheck()
const currentUserResult = ref<unknown>(null)
const checkUserResult = ref<unknown>(null)
const logoutUserResult = ref<unknown>(null)
const userName = computed<string>(() => String(auth.value?.user?.name || '访客'))
const userInitial = computed<string>(() => userName.value.slice(0, 1))
const themePreferenceLabel = computed(() => {
  if (themePreference.value === 'system') {
    return `跟随系统 (${systemTheme.value === 'dark' ? '深色' : '浅色'})`
  }

  return themePreference.value === 'dark' ? '深色模式' : '浅色模式'
})
const heroStyle = {
  backgroundColor: 'var(--dux-color-primary)',
}
const resultPanels = computed(() => [
  {
    key: 'current',
    title: '获取用户结果',
    value: currentUserResult.value,
  },
  {
    key: 'check',
    title: '验证用户结果',
    value: checkUserResult.value,
  },
  {
    key: 'logout',
    title: '退出登录结果',
    value: logoutUserResult.value,
  },
])

usePageTitle('我的')

function cloneValue<T>(value: T): T {
  if (value === undefined) {
    return null as T
  }
  try {
    return JSON.parse(JSON.stringify(value)) as T
  }
  catch {
    return value
  }
}

function stringifyResult(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return '暂无数据'
  }
  try {
    return JSON.stringify(value, null, 2)
  }
  catch {
    return String(value)
  }
}

function captureError(error: unknown) {
  const input = error as {
    message?: string
    result?: unknown
  }
  return cloneValue(input?.result || {
    success: false,
    message: input?.message || '请求失败',
  })
}

function getCurrentUser() {
  currentUserResult.value = cloneValue(auth.value)
}

function toggleThemeMode() {
  if (!canSetThemePreference.value) {
    toast.show('当前平台仅支持跟随系统主题')
    return
  }

  cycleThemePreference()
  toast.show(`主题已切换为${themePreferenceLabel.value}`)
}

async function validateUser() {
  try {
    const result = await checkAction.check({})
    checkUserResult.value = cloneValue(result)
    toast.success(result.success ? '用户验证完成' : (result.message || '用户验证失败'))
  }
  catch (error) {
    checkUserResult.value = captureError(error)
    toast.warning('用户验证失败')
  }
}

async function logoutUser() {
  try {
    const result = await (dux.config.authProvider?.logout?.({}, dux) || Promise.resolve({
      success: true,
      message: '已退出登录',
    }))
    await dux.session.clear()
    authStore.clear()
    logoutUserResult.value = cloneValue(result)
    currentUserResult.value = cloneValue(null)
    toast.success(result.message || '已退出登录')
  }
  catch (error) {
    logoutUserResult.value = captureError(error)
    toast.warning('退出登录失败')
  }
}

const openLogin = wrapAsyncEvent('account.openLogin', async () => {
  await router.login()
})
</script>

<template>
  <view class="account-page flex flex-col gap-[24rpx]">
    <view class="rounded-[32rpx] px-[32rpx] py-[40rpx]" :style="heroStyle">
      <view class="flex items-start gap-[24rpx]">
        <wd-avatar :size="56" bg-color="var(--dux-color-glass-strong)">
          {{ userInitial }}
        </wd-avatar>
        <view class="flex flex-1 flex-col gap-[6rpx]">
          <text class="text-[36rpx] text-inverse font-bold">
            {{ userName }}
          </text>
          <text class="text-[24rpx] text-inverse-muted">
            {{ isLogin ? '当前账号已登录，可直接演示用户获取、验证与退出。' : '当前未登录，可先前往登录后再体验账户动作。' }}
          </text>
        </view>
        <wd-tag :type="isLogin ? 'success' : 'warning'" size="small">
          {{ isLogin ? '已登录' : '未登录' }}
        </wd-tag>
      </view>
      <view class="mt-[20rpx] flex items-center justify-between gap-[16rpx] rounded-[22rpx] bg-glass-soft px-[22rpx] py-[18rpx]">
        <view class="flex flex-col gap-[6rpx]">
          <text class="text-[24rpx] text-inverse font-semibold">
            界面主题
          </text>
          <text class="text-[22rpx] text-inverse-muted leading-[1.6]">
            {{ canSetThemePreference ? themePreferenceLabel : `跟随系统 (${systemTheme === 'dark' ? '深色' : '浅色'})` }}
          </text>
        </view>
        <view
          v-if="canSetThemePreference"
          class="shrink-0 inline-flex items-center justify-center rounded-full border border-white/25 bg-glass-strong px-[28rpx] py-[14rpx]"
          hover-class="opacity-85"
          @click="toggleThemeMode"
        >
          <text class="text-[24rpx] text-inverse font-semibold leading-[1.2]">
            切换模式
          </text>
        </view>
      </view>
    </view>

    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group title="账户能力演示" border>
        <wd-cell title="获取用户" is-link @click="getCurrentUser" />
        <wd-cell title="验证用户" is-link @click="validateUser" />
        <wd-cell title="退出登录" is-link @click="logoutUser" />
      </wd-cell-group>
    </view>

    <view v-if="!isLogin" class="flex flex-col gap-[16rpx] rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        当前未登录
      </text>
      <text class="text-[24rpx] text-neutral-muted leading-relaxed">
        退出登录后仍然保留当前页面，方便查看返回结果。需要重新体验获取和验证时，可以直接回到登录页重新进入。
      </text>
      <wd-button type="primary" block @click="openLogin">
        前往登录
      </wd-button>
    </view>

    <view class="flex flex-col gap-[16rpx]">
      <view
        v-for="panel in resultPanels"
        :key="panel.key"
        class="flex flex-col gap-[14rpx] rounded-[24rpx] bg-surface p-[24rpx]"
      >
        <text class="text-[30rpx] text-neutral-stronger font-semibold">
          {{ panel.title }}
        </text>
        <view class="rounded-[20rpx] bg-background p-[20rpx]">
          <text class="block whitespace-pre-wrap break-all text-[22rpx] text-neutral-strong leading-[1.7]">
            {{ stringifyResult(panel.value) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
