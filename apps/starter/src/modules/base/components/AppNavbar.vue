<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { resolveDuxConfig, useAppStore, useRoute, useRouter, useUniApp } from '@duxweb/uni'
import { computed, onMounted, ref } from 'vue'
import duxConfig from '@/dux.config'
import { wrapAsyncEvent } from '@/utils/async'

const props = withDefaults(defineProps<{
  hidden?: boolean
}>(), {
  hidden: false,
})

const dux = useUniApp()
const config = resolveDuxConfig(duxConfig)
const router = useRouter()
const route = useRoute()
const appStore = useAppStore(dux.pinia as never)
const stackDepth = ref(1)

function syncStackDepth() {
  stackDepth.value = Math.max(getCurrentPages().length, 1)
}

const visible = computed(() => !props.hidden)
const canBack = computed(() => !route.tabBar && stackDepth.value > 1)
const immersive = computed(() => Boolean(route.meta?.immersive))
const showBorder = computed(() => !route.tabBar && !immersive.value)
const title = computed(() => {
  if (appStore.pagePath === route.path && appStore.pageTitle) {
    return appStore.pageTitle
  }
  return route.meta?.navbarTitle || route.meta?.title || config.app.title
})
const rightText = computed(() => String(route.meta?.navbarRightText || ''))

const handleClickLeft = wrapAsyncEvent('navbar.back', async () => {
  if (!canBack.value) {
    return
  }
  await router.back()
})

onMounted(syncStackDepth)
onShow(syncStackDepth)
</script>

<template>
  <wd-navbar
    v-if="visible"

    placeholder safe-area-inset-top fixed
    :bordered="showBorder"
    :title="title"
    :left-arrow="canBack"
    :right-text="rightText"
    @click-left="handleClickLeft"
  />
</template>
