import { describe, expect, it } from 'vitest'
import { useDownload } from '../src/hooks/download'
import { useUpload } from '../src/hooks/upload'

const app = {
  session: {
    getAuth() {
      return null
    },
  },
} as any

describe('upload and download hooks', () => {
  it('tracks upload state with a custom executor', async () => {
    const upload = useUpload(app, {
      url: 'https://example.com/upload',
      autoUpload: false,
      executor: async ({ onProgress }) => {
        onProgress?.({
          loaded: 10,
          total: 10,
          percent: 100,
        })
        return { ok: true }
      },
    })

    const [file] = await upload.add({
      filePath: '/tmp/demo.png',
      name: 'demo.png',
      size: 10,
    })
    const result = await upload.upload(file)

    expect(result).toEqual({ ok: true })
    expect(upload.files.value[0].status).toBe('success')
    expect(upload.files.value[0].progress?.percent).toBe(100)
  })

  it('tracks download state with a custom executor', async () => {
    const download = useDownload(app, {
      url: 'https://example.com/report.pdf',
      executor: async ({ onProgress }) => {
        onProgress?.({
          loaded: 10,
          total: 10,
          percent: 100,
        })
        return {
          tempFilePath: '/tmp/report.pdf',
        }
      },
    })

    const result = await download.download()

    expect(result.tempFilePath).toBe('/tmp/report.pdf')
    expect(download.progress.value?.percent).toBe(100)
  })
})
