# 设备与原生能力

这一部分封装的是 uni-app 原生能力，不是浏览器专属能力。

## useAuthorize

用于统一查询和申请原生权限，比如定位、相册、摄像头这类权限。

```ts
const authorize = useAuthorize(scope)
```

```ts
import { useAuthorize } from '@duxweb/uni'

const authorize = useAuthorize('scope.userLocation')

await authorize.ensure() // 先检查权限，不够时再申请
```

## useLocation

用于处理定位相关能力，统一了获取定位、地图选点和打开地图导航。

```ts
const location = useLocation(options?)
```

```ts
import { useLocation } from '@duxweb/uni'

const location = useLocation()

await location.get() // 获取当前位置
await location.choose() // 打开地图选点
await location.open() // 打开地图导航
```

## useImagePicker

用于调起图片选择器，并把结果整理成统一文件结构。

```ts
const picker = useImagePicker(options?)
```

```ts
import { useImagePicker } from '@duxweb/uni'

const picker = useImagePicker({
  count: 3, // 最多选择 3 张图片
})

await picker.pick()
```

## useClipboard

用于读取或复制剪贴板内容，避免页面直接调用底层 API。

```ts
const clipboard = useClipboard()
```

```ts
import { useClipboard } from '@duxweb/uni'

const clipboard = useClipboard()

await clipboard.copy('Dux Uni') // 复制文本
```

## useScanCode

用于调起扫码能力，适合二维码、条形码和设备码扫描场景。

```ts
const scanner = useScanCode()
const result = await scanner.scan(options?)
```

```ts
import { useScanCode } from '@duxweb/uni'

const scanner = useScanCode()

const result = await scanner.scan()
```

## useShare

用于发起原生分享，统一传参和调用方式。

```ts
const share = useShare()
await share.open(options)
```

```ts
import { useShare } from '@duxweb/uni'

const share = useShare()

await share.open({
  provider: 'weixin',
  type: 0,
  title: '分享标题',
})
```

## usePhoneCall

用于直接调起拨号能力，适合客服热线、门店电话等场景。

```ts
const call = usePhoneCall()
await call.call(phone)
```

```ts
import { usePhoneCall } from '@duxweb/uni'

const call = usePhoneCall()

await call.call('10086')
```

## useOpenLocation

用于直接打开地图导航，不需要自己先处理定位对象和跳转参数。

```ts
const openLocation = useOpenLocation()
await openLocation.open(options)
```

适合：

- 打开地图导航
- 纯导航场景，不需要先取定位

## useUpload

用于上传文件并跟踪进度，适合图片上传、附件上传和表单上传。

```ts
const upload = useUpload(options)
```

```ts
import { useUpload } from '@duxweb/uni'

const upload = useUpload({
  path: 'upload/image', // 上传接口路径
  formName: 'file', // 文件字段名
  autoUpload: true, // 选完后自动上传
})
```

适合：

- 图片上传
- 附件上传
- 需要进度跟踪的上传场景

## useDownload

用于下载文件并处理保存或打开，适合导出报表、下载附件和资源缓存。

```ts
const download = useDownload(options)
```

```ts
import { useDownload } from '@duxweb/uni'

const download = useDownload({
  path: 'export/orders', // 下载接口路径
})

await download.start()
```

适合：

- 导出文件
- 下载临时资源
- 下载后保存或打开
