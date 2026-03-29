<route lang="json">
{
  "title": "弹层能力"
}
</route>

<script setup lang="ts">
import { useConfirm, useDrawer, useModal, usePageTitle } from '@duxweb/uni'
import { computed, ref } from 'vue'
import { overlayKeys } from '@/runtime/generated/overlay-keys'

const confirm = useConfirm()
const modal = useModal()
const drawer = useDrawer()
const latestResult = ref('')

usePageTitle('弹层能力')

const latestText = computed(() => latestResult.value || '暂无最近结果')

async function runConfirm() {
  const result = await confirm.open({
    title: '确认同步缓存',
    message: '这会重新拉取列表与首页概览数据，并触发所有相关查询失效刷新。',
    confirmText: '继续同步',
    cancelText: '先等等',
  })
  latestResult.value = result ? 'confirm: 用户确认执行同步' : 'confirm: 用户取消了本次操作'
}

async function runModal() {
  const result = await modal.open({
    title: '编辑通知偏好',
    confirmText: '保存配置',
    payload: {
      name: '演示用户',
      notify: true,
      channel: '站内消息',
    },
    componentKey: overlayKeys.featureSettingsOverlay,
    frame: 'page',
    onConfirm({ payload }) {
      return payload
    },
    onClose() {
      latestResult.value = 'modal: 用户关闭了弹层'
    },
  })
  if (typeof result !== 'undefined') {
    latestResult.value = `modal: ${JSON.stringify(result || {})}`
  }
}

async function runDrawer() {
  const result = await drawer.open({
    title: '抽屉配置面板',
    confirmText: '应用设置',
    width: '760rpx',
    frame: 'page',
    payload: {
      name: '运维频道',
      notify: false,
      channel: '企业微信',
    },
    componentKey: overlayKeys.featureSettingsOverlay,
    onConfirm({ payload }) {
      return payload
    },
    onClose() {
      latestResult.value = 'drawer: 用户关闭了抽屉'
    },
  })
  if (typeof result !== 'undefined') {
    latestResult.value = `drawer: ${JSON.stringify(result || {})}`
  }
}

async function runModalForm() {
  const result = await modal.open({
    title: '模态创建工单',
    confirmText: '创建工单',
    payload: {
      mode: 'create',
    },
    componentKey: overlayKeys.featureOrderOverlay,
    frame: 'page',
    onClose() {
      latestResult.value = 'modal-form: 用户关闭了创建弹层'
    },
  })

  if (typeof result !== 'undefined') {
    latestResult.value = `modal-form: ${JSON.stringify(result || {})}`
  }
}

async function runDrawerForm() {
  const result = await drawer.open({
    title: '抽屉编辑工单',
    confirmText: '保存修改',
    width: '760rpx',
    frame: 'page',
    payload: {
      mode: 'edit',
      id: 1002,
    },
    componentKey: overlayKeys.featureOrderOverlay,
    onClose() {
      latestResult.value = 'drawer-form: 用户关闭了编辑抽屉'
    },
  })

  if (typeof result !== 'undefined') {
    latestResult.value = `drawer-form: ${JSON.stringify(result || {})}`
  }
}
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group border>
        <wd-cell title="确认弹窗" label="底部按钮全宽 confirm" is-link @click="runConfirm" />
        <wd-cell title="模态弹层页面" label="DuxModalPage + 表单页壳" is-link @click="runModal" />
        <wd-cell title="抽屉弹层页面" label="DuxDrawerPage + 表单页壳" is-link @click="runDrawer" />
        <wd-cell title="模态表单" label="AsyncForm 创建" is-link @click="runModalForm" />
        <wd-cell title="抽屉表单" label="AsyncForm 编辑" is-link @click="runDrawerForm" />
      </wd-cell-group>
    </view>

    <view class="flex flex-col gap-[12rpx] overflow-hidden rounded-[24rpx] bg-surface px-[24rpx] py-[24rpx]">
      <text class="text-[28rpx] text-neutral-stronger font-semibold">
        最近结果
      </text>
      <text class="text-[24rpx] text-neutral-muted leading-[1.7]">
        {{ latestText }}
      </text>
    </view>
  </view>
</template>
