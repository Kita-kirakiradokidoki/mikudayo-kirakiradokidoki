import { useEffect, useState } from 'react'
import { SITE_CONFIG } from '../../site.config'
import { withBase } from '../../lib/base'

export default function VideoWallpaper() {
  const cfg = SITE_CONFIG.lofi.wallpapers
  const videos = cfg.videos
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true) // true = showing videos[idx]

  useEffect(() => {
    if (videos.length <= 1) return
    const id = window.setInterval(() => {
      // fade out current, then swap
      setFade(false)
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % videos.length)
        setFade(true)
      }, 900)
    }, cfg.swapSeconds * 1000)
    return () => window.clearInterval(id)
  }, [videos.length, cfg.swapSeconds])

  if (videos.length === 0) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      {videos.map((v, i) => (
        <video
          key={v}
          src={withBase(v)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === idx ? (fade ? 'opacity-100' : 'opacity-0') : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}
