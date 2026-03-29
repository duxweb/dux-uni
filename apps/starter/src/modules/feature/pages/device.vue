<route lang="json">
{
  "title": "设备能力"
}
</route>

<script setup lang="ts">
import { useImagePicker, useLocation, usePageTitle } from '@duxweb/uni'
import { computed } from 'vue'
import { useToast } from 'wot-design-uni/components/wd-toast/index'

const toast = useToast()
const imagePicker = useImagePicker()
const location = useLocation()

const imageResult = computed(() => imagePicker.files.value)
const locationResult = computed(() => location.value.value)
const imagePreview = computed(() => imagePicker.files.value[0]?.path || '')

usePageTitle('设备能力')

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

async function openCamera() {
  try {
    await imagePicker.pick({
      count: 1,
      sourceType: ['camera'],
    })
    toast.success('相机调用成功')
  }
  catch (error) {
    toast.warning((error as Error)?.message || '相机调用失败')
  }
}

async function getCurrentLocation() {
  try {
    await location.get()
    toast.success('位置获取成功')
  }
  catch (error) {
    toast.warning((error as Error)?.message || '位置获取失败')
  }
}

async function chooseLocationOnMap() {
  try {
    await location.choose()
    toast.success('地图选点成功')
  }
  catch (error) {
    toast.warning((error as Error)?.message || '地图选点失败')
  }
}

async function openSelectedLocation() {
  const current = location.value.value
  if (!current?.latitude || !current?.longitude) {
    toast.warning('请先获取或选择一个位置')
    return
  }
  try {
    await location.open({
      latitude: current.latitude,
      longitude: current.longitude,
      name: current.name,
      address: current.address,
    })
  }
  catch (error) {
    toast.warning((error as Error)?.message || '地图打开失败')
  }
}
</script>

<template>
  <view class="flex flex-col gap-[24rpx]">
    <view class="overflow-hidden rounded-[24rpx]">
      <wd-cell-group title="设备与地图能力" border>
        <wd-cell title="调用相机" value="useImagePicker.pick" is-link @click="openCamera" />
        <wd-cell title="获取当前位置" value="useLocation.get" is-link @click="getCurrentLocation" />
        <wd-cell title="地图选点" value="useLocation.choose" is-link @click="chooseLocationOnMap" />
        <wd-cell title="打开地图" value="useLocation.open" is-link @click="openSelectedLocation" />
      </wd-cell-group>
    </view>

    <view class="flex flex-col gap-[14rpx] rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        相机返回结果
      </text>
      <view v-if="imagePreview" class="overflow-hidden rounded-[20rpx]">
        <wd-img
          :src="imagePreview"
          width="100%"
          height="320rpx"
          mode="aspectFill"
        />
      </view>
      <view class="rounded-[20rpx] bg-background p-[20rpx]">
        <text class="block whitespace-pre-wrap break-all text-[22rpx] text-neutral-strong leading-[1.7]">
          {{ stringifyResult(imageResult) }}
        </text>
      </view>
    </view>

    <view class="flex flex-col gap-[14rpx] rounded-[24rpx] bg-surface p-[24rpx]">
      <text class="text-[30rpx] text-neutral-stronger font-semibold">
        定位 / 地图返回结果
      </text>
      <view class="rounded-[20rpx] bg-background p-[20rpx]">
        <text class="block whitespace-pre-wrap break-all text-[22rpx] text-neutral-strong leading-[1.7]">
          {{ stringifyResult(locationResult) }}
        </text>
      </view>
    </view>
  </view>
</template>
