import { useState } from 'react'
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react'
import { useBgm } from './AudioProvider'
import { withBase } from '../lib/base'

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Collapse motion mirrors FloatingSteam: width-only transition with an
// iOS-style strong ease-out. Height follows content (auto) so the cover is
// never clipped. Avatar uses inline `borderWidth` so the collapsed state has
// no border (otherwise the base `border` 1px would clip the 64px cover).
const EASE = 'var(--ease-drawer)'
const DURATION_IN = '450ms'
const DURATION_OUT = '270ms'

export default function FloatingPlayer() {
  const {
    available,
    playing,
    toggle,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    muted,
    toggleMute,
    meta,
  } = useBgm()
  const [collapsed, setCollapsed] = useState(true)

  if (!available) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`relative z-50 origin-bottom-right scale-[1.2] overflow-hidden rounded-2xl border bg-ink/80 shadow-xl backdrop-blur-md ${
        collapsed ? 'w-16 border-transparent' : 'w-[316px] border-ink-2/20'
      }`}
      style={{
        transitionProperty: 'width, border-color',
        transitionDuration: collapsed ? DURATION_OUT : DURATION_IN,
        transitionTimingFunction: EASE,
        // inline width beats the base `border` class so collapsed has no border
        borderWidth: collapsed ? '0px' : '1px',
      }}
    >
      <div
        className="flex items-stretch"
        style={{
          gap: collapsed ? '0px' : '12px',
          padding: collapsed ? '0px' : '12px',
          transitionProperty: 'gap, padding',
          transitionDuration: collapsed ? DURATION_OUT : DURATION_IN,
          transitionTimingFunction: EASE,
        }}
      >
        {/* left: square album cover (fixed size in both states) */}
        <button
          onClick={toggle}
          aria-label={playing ? '暂停' : '播放'}
          className={`relative size-16 shrink-0 overflow-hidden bg-ink-2 press-md ${
            collapsed ? 'rounded-2xl' : 'rounded-xl border border-ink-2/20'
          }`}
          style={{
            transitionProperty: 'border-radius, border-color',
            transitionDuration: collapsed ? DURATION_OUT : DURATION_IN,
            transitionTimingFunction: EASE,
          }}
        >
          {meta.cover ? (
            <img src={withBase(meta.cover)} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-accent">
              <Music className="size-6" />
            </span>
          )}

          {/* playback progress: only when collapsed, 5px from the bottom inner edge */}
          {collapsed && (
            <span className="absolute inset-x-[5px] bottom-[5px] block h-[3px] rounded-full bg-black/40">
              <span
                className="bg-gradient-accent block h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </span>
          )}
        </button>

        {/* right: title / progress / controls (animated in/out) */}
        <div
          className="flex min-w-0 flex-col overflow-hidden"
          style={{
            width: collapsed ? '0px' : '220px',
            height: collapsed ? '0px' : 'auto',
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? 'translateX(-10px)' : 'translateX(0px)',
            transitionProperty: 'width, height, opacity, transform',
            transitionDuration: collapsed ? DURATION_OUT : DURATION_IN,
            transitionTimingFunction: EASE,
            // content slides in *after* the shell has begun opening
            transitionDelay: collapsed ? '0ms' : '90ms',
          }}
        >
          <p className="truncate text-center font-mono text-xs tracking-wide text-paper">
            {meta.title}
          </p>
          {meta.artist && (
            <p className="truncate text-center font-mono text-[10px] text-dim">{meta.artist}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="w-8 text-right font-mono text-[10px] text-dim">{fmt(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1"
              aria-label="播放进度"
            />
            <span className="w-8 font-mono text-[10px] text-dim">{fmt(duration)}</span>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              onClick={toggle}
              aria-label={playing ? '暂停' : '播放'}
              className="bg-gradient-accent grid size-9 shrink-0 place-items-center rounded-full text-ink shadow-lg transition-transform duration-150 ease-[var(--ease-out)] hover:scale-105 active:scale-95"
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 translate-x-[1px]" />
              )}
            </button>

            {/* volume control + mute toggle */}
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                onClick={toggleMute}
                aria-label={muted ? '取消静音' : '静音'}
                aria-pressed={muted}
                className={`shrink-0 transition-colors press-sm ${
                  muted ? 'text-amber' : 'text-dim hover:text-paper'
                }`}
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 w-16"
                aria-label="音量"
              />
              <span className="w-7 shrink-0 font-mono text-[10px] text-dim">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
