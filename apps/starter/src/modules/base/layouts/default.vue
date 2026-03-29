<script setup lang="ts">
import { resolveDuxConfig, useRoute, useThemePreference } from '@duxweb/uni'
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import { computed } from 'vue'
import duxConfig from '@/dux.config'
import AppNavbar from '../components/AppNavbar.vue'

const dux = resolveDuxConfig(duxConfig)
const { currentTheme } = useThemePreference()
const route = useRoute()
const hideNavbar = computed(() => Boolean(route.meta?.immersive || route.meta?.guestOnly))
</script>

<template>
  <DuxRoot :theme="currentTheme" :tokens="dux.ui.tokens">
    <view
      class="relative min-h-screen overflow-hidden bg-background pb-[48rpx]"
      :class="hideNavbar ? 'px-0' : 'px-[28rpx]'"
    >
      <AppNavbar :hidden="hideNavbar" />
      <view class="relative z-1" :class="hideNavbar ? '' : 'pt-[28rpx]'">
        <slot />
      </view>
    </view>
  </DuxRoot>
</template>
