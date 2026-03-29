<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useRouter } from '@duxweb/uni'
import { computed, onMounted, ref } from 'vue'
import { routerManifest } from '@/runtime/router/manifest'

const router = useRouter()
const currentPath = ref('')
const activeName = ref('')
const navigating = ref(false)

const iconMap: Record<string, string> = {
  home: 'home',
  index: 'home',
  feature: 'view-list',
  account: 'user',
}

function getTabItem(name: string, fallbackTitle: string) {
  const page = routerManifest.tabBarPages.find(item => item.module === name || item.name === `${name}.index`)
  return {
    name,
    path: page?.path || `/pages/${name}/index`,
    title: page?.title || fallbackTitle,
    icon: iconMap[name] || iconMap.home,
  }
}

const homeItem = computed(() => getTabItem('home', '首页'))
const featureItem = computed(() => getTabItem('feature', '功能'))
const accountItem = computed(() => getTabItem('account', '我的'))
const allItems = computed(() => [homeItem.value, featureItem.value, accountItem.value])
const tabbarWrapperStyle = computed(() => ({
  bottom: 'calc(env(safe-area-inset-bottom) + 18rpx)',
  zIndex: 50,
}))

function normalizePath(path = '') {
  if (!path) {
    return ''
  }
  return path.startsWith('/') ? path : `/${path}`
}

function resolveTabItemName(ref?: string) {
  if (!ref) {
    return ''
  }

  const matchedByName = allItems.value.find(item => item.name === ref)
  if (matchedByName) {
    return matchedByName.name
  }

  const matchedPage = routerManifest.tabBarPages.find(page =>
    page.name === ref
    || page.module === ref
    || normalizePath(page.path) === normalizePath(ref),
  )

  if (!matchedPage) {
    return ''
  }

  return allItems.value.find(item => normalizePath(item.path) === normalizePath(matchedPage.path))?.name || ''
}

function resolveActiveName(path: string) {
  const normalizedPath = normalizePath(path)
  const currentPage = routerManifest.pages.find(page => normalizePath(page.path) === normalizedPath)

  if (!currentPage) {
    return homeItem.value.name
  }

  if (currentPage.tabBar) {
    return resolveTabItemName(currentPage.name)
      || resolveTabItemName(currentPage.module)
      || homeItem.value.name
  }

  const explicitTab = resolveTabItemName(typeof currentPage.tabBarActive === 'string' ? currentPage.tabBarActive : '')
  if (explicitTab) {
    return explicitTab
  }

  const inheritedTab = resolveTabItemName(currentPage.module)
  if (inheritedTab) {
    return inheritedTab
  }

  return homeItem.value.name
}

function syncCurrentPath() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as { route?: string } | undefined
  currentPath.value = normalizePath(current?.route || '')
  activeName.value = resolveActiveName(currentPath.value)
}

function resolveTabbarChangeValue(event: unknown) {
  if (typeof event === 'string' || typeof event === 'number') {
    return event
  }

  if (!event || typeof event !== 'object') {
    return undefined
  }

  const input = event as {
    value?: string | number
    detail?: {
      value?: string | number
    }
  }

  return input.value ?? input.detail?.value
}

async function handleChange(event: unknown) {
  if (navigating.value) {
    return
  }

  const value = resolveTabbarChangeValue(event)
  const item = allItems.value.find(entry => entry.name === value)

  if (!item) {
    activeName.value = resolveActiveName(currentPath.value)
    return
  }

  if (normalizePath(item.path) === currentPath.value) {
    activeName.value = item.name
    return
  }

  try {
    navigating.value = true
    activeName.value = item.name
    await router.reLaunch(item.path)
  }
  catch (error) {
    activeName.value = resolveActiveName(currentPath.value)
    console.error('[starter] tabbar navigation failed', error)
  }
  finally {
    navigating.value = false
  }
}

onMounted(syncCurrentPath)
onShow(syncCurrentPath)
</script>

<template>
  <view class="fixed left-0 right-0" :style="tabbarWrapperStyle">
    <wd-tabbar
      v-model="activeName"
      shape="round"
      :bordered="false"
      @change="handleChange"
    >
      <wd-tabbar-item
        :name="homeItem.name"
        :title="homeItem.title"
        :icon="homeItem.icon"
      />
      <wd-tabbar-item
        :name="featureItem.name"
        :title="featureItem.title"
        :icon="featureItem.icon"
      />
      <wd-tabbar-item
        :name="accountItem.name"
        :title="accountItem.title"
        :icon="accountItem.icon"
      />
    </wd-tabbar>
  </view>
</template>
