import type { UniAppContext } from '../types'
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { runAuthCheckOnLaunch, runAuthCheckOnShow } from '../runtime/auth'

export function setupUniAppLifecycle(dux: UniAppContext) {
  const getManagers = () => [dux.socket, ...Object.values(dux.sockets)]

  onLaunch(() => {
    void dux.ready.then(() => {
      return runAuthCheckOnLaunch(dux).then(() => {
        getManagers().forEach(manager => manager.onLaunch())
      })
    })
  })

  onShow(() => {
    void dux.ready.then(() => {
      return runAuthCheckOnShow(dux).then(() => {
        getManagers().forEach(manager => manager.onShow())
      })
    })
  })

  onHide(() => {
    void dux.ready.then(() => {
      getManagers().forEach(manager => manager.onHide())
    })
  })

  return dux
}
