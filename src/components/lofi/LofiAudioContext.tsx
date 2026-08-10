import { createContext, useContext, useRef, type ReactNode } from 'react'

type LofiAudioCtx = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  wantPlayRef: React.MutableRefObject<boolean>
  /** try to start playback (autoplay or click-degrade); safe to call repeatedly */
  requestPlay: () => void
}

const Ctx = createContext<LofiAudioCtx | null>(null)

export function LofiAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wantPlayRef = useRef(false)

  const requestPlay = () => {
    wantPlayRef.current = true
    const el = audioRef.current
    if (!el) return
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }

  return (
    <Ctx.Provider value={{ audioRef, wantPlayRef, requestPlay }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLofiAudio(): LofiAudioCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLofiAudio must be used within LofiAudioProvider')
  return ctx
}
