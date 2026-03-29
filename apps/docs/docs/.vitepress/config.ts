import { withDuxTheme } from '@duxweb/vitepress-theme/config'

export default withDuxTheme({
  title: 'Dux Uni',
  description: '@duxweb/uni 与 @duxweb/uni-pro 文档',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    build: {
      cssMinify: false,
      chunkSizeWarningLimit: 1500,
    },
  },
  themeConfig: {
    nav: [
      { text: '概述', link: '/guide/overview' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '开发应用', link: '/guide/development-flow' },
      { text: '@duxweb/uni', link: '/uni/hooks' },
      { text: '@duxweb/uni-pro', link: '/uni-pro/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '概述',
          items: [
            { text: '概述', link: '/guide/overview' },
            { text: '功能概览', link: '/guide/feature-overview' },
            { text: '应用架构', link: '/guide/app-architecture' },
            { text: '按场景找能力', link: '/guide/scenarios' },
          ],
        },
        {
          text: '快速开始',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '创建项目', link: '/guide/quick-start/create-project' },
            { text: '安装与启动', link: '/guide/quick-start/run-project' },
            { text: '项目结构', link: '/guide/quick-start/project-structure' },
            { text: '最小可运行应用', link: '/guide/minimal-app' },
          ],
        },
        {
          text: '开发应用',
          items: [
            { text: '开发应用', link: '/guide/development-flow' },
            { text: '模块开发', link: '/guide/develop/modules' },
            { text: '页面与路由', link: '/guide/develop/routes-and-pages' },
            { text: '模块入口与生命周期', link: '/guide/develop/module-entry' },
            { text: '第一个业务模块', link: '/guide/first-module' },
            { text: '应用生命周期', link: '/guide/runtime-entry' },
            { text: '初始化配置', link: '/guide/dux-ts' },
            { text: '应用配置', link: '/guide/configuration' },
            { text: 'CLI 与命令', link: '/guide/cli' },
            { text: '自动生成产物', link: '/guide/generated-files' },
            { text: 'Starter 对照', link: '/guide/starter-showcase' },
          ],
        },
      ],
      '/uni/': [
        {
          text: '总览',
          items: [
            { text: 'Hook 总览', link: '/uni/hooks' },
            { text: 'API Reference', link: '/uni/api-reference' },
            { text: '实战 Recipes', link: '/uni/recipes' },
          ],
        },
        {
          text: '路由与页面',
          items: [
            { text: 'useRouter', link: '/uni/router#userouter' },
            { text: 'useRoute', link: '/uni/router#useroute' },
            { text: 'usePageTitle', link: '/uni/router#usepagetitle' },
            { text: 'usePageGuard', link: '/uni/router#usepageguard' },
            { text: '页面 Route', link: '/uni/page-route' },
            { text: '页面运行时', link: '/uni/page-runtime' },
          ],
        },
        {
          text: '请求与数据',
          items: [
            { text: '请求配置', link: '/uni/request' },
            { text: 'useList', link: '/uni/data#uselist' },
            { text: 'useInfiniteList', link: '/uni/data#useinfinitelist' },
            { text: 'useOne', link: '/uni/data#useone' },
            { text: 'useMany', link: '/uni/data#usemany' },
            { text: 'useCustom', link: '/uni/data#usecustom' },
            { text: 'useCreate', link: '/uni/data#usecreate' },
            { text: 'useUpdate', link: '/uni/data#useupdate' },
            { text: 'useDelete', link: '/uni/data#usedelete' },
            { text: 'useCustomMutation', link: '/uni/data#usecustommutation' },
            { text: 'useInvalidate', link: '/uni/data#useinvalidate' },
            { text: 'useRefetch', link: '/uni/data#userefetch' },
          ],
        },
        {
          text: '认证与权限',
          items: [
            { text: 'useAuth', link: '/uni/auth#useauth' },
            { text: 'useLogin', link: '/uni/auth#uselogin' },
            { text: 'useLogout', link: '/uni/auth#uselogout' },
            { text: 'useCheck', link: '/uni/auth#usecheck' },
            { text: 'useCan', link: '/uni/auth#usecan' },
            { text: 'simpleAuthProvider', link: '/uni/auth#simpleauthprovider' },
          ],
        },
        {
          text: '表单与弹层',
          items: [
            { text: 'useForm', link: '/uni/data#useform' },
            { text: 'useSelect', link: '/uni/data#useselect' },
            { text: 'useTree', link: '/uni/data#usetree' },
            { text: 'useConfirm', link: '/uni/overlay#useconfirm' },
            { text: 'useModal', link: '/uni/overlay#usemodal' },
            { text: 'useDrawer', link: '/uni/overlay#usedrawer' },
            { text: 'useOverlayContext', link: '/uni/overlay#useoverlaycontext' },
            { text: 'useOverlayEntries', link: '/uni/overlay#useoverlayentries' },
          ],
        },
        {
          text: '事件与实时',
          items: [
            { text: 'useEvent', link: '/uni/realtime#useevent' },
            { text: 'useListener', link: '/uni/realtime#uselistener' },
            { text: 'useListenerOnce', link: '/uni/realtime#uselisteneronce' },
            { text: 'useListenerOnly', link: '/uni/realtime#uselisteneronly' },
            { text: 'useSocket', link: '/uni/socket#usesocket' },
            { text: 'useSocketManager', link: '/uni/socket#usesocketmanager' },
            { text: 'useSocketManagers', link: '/uni/socket#usesocketmanagers' },
            { text: 'useSSE', link: '/uni/sse#usesse' },
            { text: 'useEventSource', link: '/uni/sse#useeventsource' },
          ],
        },
        {
          text: '设备与原生能力',
          items: [
            { text: 'useAuthorize', link: '/uni/device#useauthorize' },
            { text: 'useLocation', link: '/uni/device#uselocation' },
            { text: 'useImagePicker', link: '/uni/device#useimagepicker' },
            { text: 'useClipboard', link: '/uni/device#useclipboard' },
            { text: 'useScanCode', link: '/uni/device#usescancode' },
            { text: 'useShare', link: '/uni/device#useshare' },
            { text: 'usePhoneCall', link: '/uni/device#usephonecall' },
            { text: 'useOpenLocation', link: '/uni/device#useopenlocation' },
            { text: 'useUpload', link: '/uni/device#useupload' },
            { text: 'useDownload', link: '/uni/device#usedownload' },
          ],
        },
        {
          text: '模块与扩展',
          items: [
            { text: '模块系统', link: '/uni/modules' },
            { text: '扩展机制', link: '/uni/extensibility' },
            { text: 'Schema 渲染', link: '/uni/schema' },
            { text: 'Schema 协议', link: '/uni/schema-protocol' },
            { text: '组件', link: '/uni/components' },
          ],
        },
      ],
      '/uni-pro/': [
        {
          text: '概览',
          items: [
            { text: '概览', link: '/uni-pro/' },
            { text: 'API Reference', link: '/uni-pro/api-reference' },
          ],
        },
        {
          text: '接入与根组件',
          items: [
            { text: 'DuxRoot', link: '/uni-pro/components#duxroot' },
            { text: 'ProAppProvider', link: '/uni-pro/components#proappprovider' },
            { text: 'DuxOverlayHost', link: '/uni-pro/components#duxoverlayhost' },
            { text: 'DuxOverlayPresenter', link: '/uni-pro/components#duxoverlaypresenter' },
          ],
        },
        {
          text: '页面与基础组件',
          items: [
            { text: 'ProPageShell', link: '/uni-pro/components#propageshell' },
            { text: 'ProSection', link: '/uni-pro/components#prosection' },
            { text: 'ProEmpty', link: '/uni-pro/components#proempty' },
          ],
        },
        {
          text: '异步组件',
          items: [
            { text: 'AsyncForm', link: '/uni-pro/components#asyncform' },
            { text: 'AsyncPicker', link: '/uni-pro/components#asyncpicker' },
            { text: 'AsyncColPicker', link: '/uni-pro/components#asynccolpicker' },
            { text: 'AsyncPickerView', link: '/uni-pro/components#asyncpickerview' },
            { text: 'AsyncUpload', link: '/uni-pro/components#asyncupload' },
          ],
        },
        {
          text: '主题与 Token',
          items: [
            { text: 'createWotThemeVars', link: '/uni-pro/theme#createwotthemevars' },
            { text: 'createUnoTheme', link: '/uni-pro/theme#createunotheme' },
            { text: 'createUniTheme', link: '/uni-pro/theme#createunitheme' },
            { text: 'defaultThemeTokens', link: '/uni-pro/theme#defaultthemetokens' },
            { text: 'defaultRadiusTokens', link: '/uni-pro/theme#defaultradiustokens' },
            { text: 'defaultSpacingTokens', link: '/uni-pro/theme#defaultspacingtokens' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/duxweb/dux-uni' },
    ],
    editLink: {
      pattern: 'https://github.com/duxweb/dux-uni/edit/main/apps/docs/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    search: {
      provider: 'local',
    },
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2026 DuxWeb',
    },
  },
})
