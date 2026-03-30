<script setup lang="ts">
import { resolveDuxConfig, useThemePreference } from '@duxweb/uni'
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import duxConfig from '@/dux.config'

const dux = resolveDuxConfig(duxConfig)
const { currentTheme } = useThemePreference()
</script>

<template>
  <DuxRoot :theme="currentTheme" :tokens="dux.ui.tokens">
    <view class="min-h-screen bg-background">
      <view
        class="flex flex-col"
        :style="{
          padding: dux.ui.spacing.page,
          gap: dux.ui.spacing.section,
          paddingBottom: `calc(env(safe-area-inset-bottom) + ${dux.ui.spacing.bottomInset})`,
        }"
      >
        <slot />
      </view>
    </view>
  </DuxRoot>
</template>
