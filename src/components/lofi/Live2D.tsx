import { useEffect } from 'react'
import { withBase } from '../../lib/base'
import { SITE_CONFIG } from '../../site.config'

export default function Live2D() {
  useEffect(() => {
    let cancelled = false
    let L2Dwidget: { init: (o?: unknown) => void; destroy?: () => void } | null = null

    const removeOldWidget = () => {
      document.getElementById('live2d')?.remove()
    }

    const cleanup = () => {
      if (L2Dwidget && typeof L2Dwidget.destroy === 'function') {
        try {
          L2Dwidget.destroy()
        } catch {
          // ignore
        }
      }
      removeOldWidget()
    }

    // clear any previous instance before (re)mount (React StrictMode double-invoke safe)
    removeOldWidget()

    import('live2d-widget')
      .then((mod) => {
        if (cancelled) return
        const w = mod.default as { init: (o?: unknown) => void; destroy?: () => void }
        L2Dwidget = w
        w.init({
          model: {
            jsonPath: withBase('/lofi/live2d/shizuku.model.json'),
            scale: 1,
          },
          display: {
            superSample: 2,
            width: 220,
            height: 220,
            position: 'left',
            hOffset: 12,
            vOffset: 0,
          },
          mobile: { show: true, scale: 0.55 },
          react: { opacityDefault: 0.9, opacityOnHover: 0.5 },
          dialog: {
            enable: true,
            hitokoto: false,
            script: { tips: SITE_CONFIG.lofi.live2d.tips, unloginList: [] },
          },
        })
      })
      .catch(() => {
        // widget failed to load (offline / network); leave the page usable
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return <div aria-hidden className="pointer-events-none fixed bottom-0 left-0 z-20" />
}
