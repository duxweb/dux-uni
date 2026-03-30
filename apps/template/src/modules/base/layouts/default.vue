<script setup lang="ts">
import { resolveDuxConfig, useThemePreference } from '@duxweb/uni'
import DuxRoot from '@duxweb/uni-pro/components/DuxRoot.vue'
import duxConfig from '@/dux.config'

const dux = resolveDuxConfig(duxConfig)
const { currentTheme } = useThemePreference()
</script>

<template>
  <DuxRoot :theme="currentTheme" :tokens="dux.ui.tokens">
    <view
      class="relative min-h-screen overflow-hidden px-[28rpx] pt-[120rpx] pb-[40rpx]"
      :style="{
        background: `linear-gradient(180deg, ${dux.ui.tokens.pageGradientFrom} 0%, ${dux.ui.tokens.pageGradientTo} 100%)`,
      }"
    >
      <view class="absolute top-[60rpx] right-[-80rpx] h-[360rpx] w-[360rpx] rounded-full bg-[radial-gradient(circle,rgba(15,118,110,0.22),transparent)] blur-sm" />
      <view class="absolute bottom-[60rpx] left-[-60rpx] h-[260rpx] w-[260rpx] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.16),transparent)] blur-sm" />
      <view class="relative z-1">
        <slot />
      </view>
    </view>
  </DuxRoot>
</template>
