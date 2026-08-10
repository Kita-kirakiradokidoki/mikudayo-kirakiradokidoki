import { createContext, useContext, useRef, useState, type ReactNode } from 'react'

type LofiAudioCtx = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  wantPlayRef: React.MutableRefObject<boolean>
  /** try to start playback (autoplay or click-degrade); safe to call repeatedly */
  requestPlay: () => void
  /** populated by LofiVisualizer; resumes the analyser's AudioContext inside a user gesture */
  resumeRef: React.MutableRefObject<(() => void) | null>
  /** incremented by LofiPlayer whenever it swaps the <audio> element */
  audioVersion: number
  /** notify consumers (LofiVisualizer) that audioRef.current now points to a new element */
  bump: () => void
}

const Ctx = createContext<LofiAudioCtx | null>(null)

export function LofiAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wantPlayRef = useRef(false)
  const resumeRef = useRef<(() => void) | null>(null)
  const [audioVersion, setAudioVersion] = useState(0)

  const bump = () => setAudioVersion((v) => v + 1)

  const requestPlay = () => {
    wantPlayRef.current = true
    // resume the analyser's AudioContext within this user-gesture call so playback isn't silent
    resumeRef.current?.()
    const el = audioRef.current
    if (!el) return
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }

  return (
    <Ctx.Provider value={{ audioRef, wantPlayRef, requestPlay, resumeRef, audioVersion, bump }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLofiAudio(): LofiAudioCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLofiAudio must be used within LofiAudioProvider')
  return ctx
}
