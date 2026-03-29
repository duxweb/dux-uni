import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { installUniApp } from '@duxweb/uni'
import App from './App.vue'
import { dux } from './dux'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)
  installUniApp(app, dux)

  return {
    app,
  }
}
