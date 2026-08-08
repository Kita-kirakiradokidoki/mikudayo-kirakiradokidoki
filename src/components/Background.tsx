import type { CSSProperties } from 'react'
import { SITE_CONFIG } from '../site.config'
import { withBase } from '../lib/base'

function imageStyle(url: string, fit: 'cover' | 'contain' | 'repeat') {
  const base: CSSProperties = { backgroundImage: `url(${url})`, backgroundPosition: 'center' }
  if (fit === 'repeat') {
    return { ...base, backgroundRepeat: 'repeat', backgroundSize: 'auto' }
  }
  if (fit === 'contain') {
    return { ...base, backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }
  }
  return { ...base, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }
}

export default function Background() {
  const { background } = SITE_CONFIG
  if (background.type !== 'image' || !background.url) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          ...imageStyle(withBase(background.url), background.fit),
          filter: background.blur > 0 ? `blur(${background.blur}px)` : undefined,
        }}
      />
      <div
        className="absolute inset-0 theme-transition"
        style={{ background: 'var(--color-ink)', opacity: background.overlay }}
      />
    </div>
  )
}
