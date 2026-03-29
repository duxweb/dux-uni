<script setup lang="ts">
import { useOverlayContext } from '@duxweb/uni'
import DuxDrawerPage from '@duxweb/uni-pro/components/DuxDrawerPage.vue'
import DuxModalPage from '@duxweb/uni-pro/components/DuxModalPage.vue'
import { computed, ref } from 'vue'
import FeatureOrderOverlayForm from './FeatureOrderOverlayForm.vue'

interface FeatureOrderOverlayPayload {
  mode?: 'create' | 'edit'
  id?: number | string
}

const overlay = useOverlayContext<FeatureOrderOverlayPayload, unknown>()
const formRef = ref<{
  submit?: () => unknown | Promise<unknown>
  refreshLayout?: () => void | Promise<void>
} | null>(null)
const mode = computed(() => overlay.payload?.mode || 'create')
const orderId = computed(() => overlay.payload?.id)
const isEdit = computed(() => mode.value === 'edit' && orderId.value != null)

async function submit() {
  return await formRef.value?.submit?.()
}

async function refreshLayout() {
  await formRef.value?.refreshLayout?.()
}

defineExpose({
  submit,
  refreshLayout,
})
</script>

<template>
  <DuxDrawerPage
    v-if="overlay.kind === 'drawer'"
    :title="isEdit ? '编辑工单' : '新建工单'"
    :confirm-text="isEdit ? '保存修改' : '创建工单'"
    :submit="submit"
  >
    <FeatureOrderOverlayForm ref="formRef" :is-edit="isEdit" :order-id="orderId" />
  </DuxDrawerPage>

  <DuxModalPage
    v-else
    :title="isEdit ? '编辑工单' : '新建工单'"
    :confirm-text="isEdit ? '保存修改' : '创建工单'"
    :submit="submit"
  >
    <FeatureOrderOverlayForm ref="formRef" :is-edit="isEdit" :order-id="orderId" />
  </DuxModalPage>
</template>
