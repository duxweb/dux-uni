<script setup lang="ts">
import { resolveDuxConfig } from '@duxweb/uni'
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import { computed } from 'vue'
import duxConfig from '@/dux.config'
import { routerManifest } from '@/runtime/router/manifest'
import AppNavbar from '../components/AppNavbar.vue'
import AppTabbar from '../components/AppTabbar.vue'
import { useStarterTheme } from '../composables/useStarterTheme'

const dux = resolveDuxConfig(duxConfig)
const { currentTheme } = useStarterTheme()
const customTabBar = computed(() => routerManifest.config.router.tabBarMode !== 'native')
</script>

<template>
  <DuxRoot :theme="currentTheme" :tokens="dux.ui.tokens">
    <view class="min-h-screen bg-background">
      <AppNavbar />
      <view
        class="flex flex-col"
        :style="{
          paddingLeft: dux.ui.spacing.page,
          paddingRight: dux.ui.spacing.page,
          paddingTop: dux.ui.spacing.section,
          gap: dux.ui.spacing.section,
          paddingBottom: customTabBar
            ? `calc(env(safe-area-inset-bottom) + ${dux.ui.spacing.bottomInset} + 124rpx)`
            : `calc(env(safe-area-inset-bottom) + ${dux.ui.spacing.bottomInset})`,
        }"
      >
        <slot />
      </view>
      <AppTabbar v-if="customTabBar" />
    </view>
  </DuxRoot>
</template>
