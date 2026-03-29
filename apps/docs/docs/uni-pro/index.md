# @duxweb/uni-pro

`@duxweb/uni-pro` 只负责 UI 适配，不负责 Headless 应用框架核心层。

## 它负责什么

```text
Wot UI 适配
Root Provider
Overlay 展示宿主
页面壳组件
主题 token 与 UnoCSS 对齐
异步 Wot 组件适配
```

## 它不负责什么

```text
路由
请求
鉴权
会话
数据查询
Schema 协议
```

这些仍然归 `@duxweb/uni`。

## 当前新增的异步组件

`uni-pro` 现在额外提供一组把 Wot UI 接到 `dux-uni` Headless 能力上的异步组件：

- `AsyncForm`
- `AsyncPicker`
- `AsyncColPicker`
- `AsyncPickerView`
- `AsyncUpload`

这些组件的目标不是替代 `@duxweb/uni` 的 Hook，而是把：

- `useForm`
- `useSelect`
- `useTree`
- `useUpload`

直接接到 Wot 的交互组件上，减少项目里重复写胶水代码。

## 为什么没有 useMessage

`useMessage` 没有继续封装。

原因很简单：Wot 自带的消息提示已经足够直接，继续包一层不会明显提升工程收益，反而会多一层心智负担。

## 推荐阅读顺序

- [组件总览](/uni-pro/components)
- [主题与 Token](/uni-pro/theme)
- [API Reference](/uni-pro/api-reference)
