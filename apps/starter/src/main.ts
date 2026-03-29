import { installUniApp } from '@duxweb/uni'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist-uni'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { dux } from './dux'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  pinia.use(piniaPersist)

  app.use(pinia)
  installUniApp(app, dux, pinia)

  return {
    app,
  }
}
