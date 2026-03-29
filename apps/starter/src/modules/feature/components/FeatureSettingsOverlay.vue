<script setup lang="ts">
import { useOverlayContext } from '@duxweb/uni'
import DuxDrawerPage from '@duxweb/uni-pro/components/DuxDrawerPage.vue'
import DuxModalPage from '@duxweb/uni-pro/components/DuxModalPage.vue'
import { reactive } from 'vue'
import FeatureSettingsOverlayFields from './FeatureSettingsOverlayFields.vue'

interface FeatureOverlayPayload {
  name?: string
  notify?: boolean
  channel?: string
}

const overlay = useOverlayContext<FeatureOverlayPayload, FeatureOverlayPayload>()
const form = reactive<FeatureOverlayPayload>({
  name: overlay.payload?.name || '演示用户',
  notify: overlay.payload?.notify ?? true,
  channel: overlay.payload?.channel || '站内消息',
})

async function submit() {
  return {
    name: form.name || '演示用户',
    notify: Boolean(form.notify),
    channel: form.channel || '站内消息',
  }
}

defineExpose({
  submit,
})
</script>

<template>
  <DuxDrawerPage
    v-if="overlay.kind === 'drawer'"
    title="编辑通知偏好"
    confirm-text="保存配置"
    :submit="submit"
  >
    <FeatureSettingsOverlayFields
      :name="form.name"
      :notify="form.notify"
      :channel="form.channel"
      @update:name="form.name = $event"
      @update:notify="form.notify = $event"
      @update:channel="form.channel = $event"
    />
  </DuxDrawerPage>

  <DuxModalPage
    v-else
    title="编辑通知偏好"
    confirm-text="保存配置"
    :submit="submit"
  >
    <FeatureSettingsOverlayFields
      :name="form.name"
      :notify="form.notify"
      :channel="form.channel"
      @update:name="form.name = $event"
      @update:notify="form.notify = $event"
      @update:channel="form.channel = $event"
    />
  </DuxModalPage>
</template>
