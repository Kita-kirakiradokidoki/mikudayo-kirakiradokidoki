import { memo, useMemo, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { SITE_CONFIG } from '../site.config'
import { useComments } from '../lib/comments'

const CommentTerminal = memo(function CommentTerminal() {
  const scope = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  // Decorative: it must keep typing on a host with no comment service, so a
  // `silent` failure is deliberately ignored — `useComments` still returns the
  // seeded comments, and those are enough.
  const { comments } = useComments({
    postId: null,
    enabled: SITE_CONFIG.comments.enabled,
    apiBase: SITE_CONFIG.comments.apiBase,
  })

  // Keyed on the (already memoised) list, so the timeline below is rebuilt when
  // the comments change and not on every unrelated re-render.
  const entries = useMemo(() => comments.map((c) => ({ id: c.author, text: c.text })), [comments])

  useGSAP(
    () => {
      const body = bodyRef.current
      const text = textRef.current
      if (!body || !text) return
      if (prefersReducedMotion()) {
        text.textContent = entries[0]?.text ?? ''
        if (labelRef.current) labelRef.current.textContent = entries[0]?.id ?? ''
        return
      }
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.55,
        repeat: -1,
        yoyo: true,
        ease: 'steps(1)',
      })
      const follow = () => {
        body.scrollTop = body.scrollHeight
      }
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      entries.forEach((entry) => {
        tl.set(labelRef.current, { text: entry.id })
          .to(text, {
            duration: gsap.utils.clamp(2, 9, entry.text.length * 0.028),
            text: entry.text,
            ease: 'none',
            onUpdate: follow,
          })
          .to({}, { duration: 2.8 })
          .to(body, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' })
          .set(text, { text: '' })
          .set(body, { scrollTop: 0 })
          .to(body, { autoAlpha: 1, duration: 0.2 })
      })
    },
    { scope, dependencies: [entries], revertOnUpdate: true },
  )

  if (entries.length === 0) return null

  return (
    <div ref={scope} className="border-line bg-ink/80 max-w-3xl border backdrop-blur-sm">
      <div className="border-line flex items-center justify-between gap-4 border-b px-4 py-2 font-mono text-[10px] tracking-[0.25em] uppercase">
        <span className="text-dim">comments</span>
        <span className="text-accent truncate normal-case">
          @ <span ref={labelRef} />
        </span>
      </div>
      <div ref={bodyRef} className="h-32 overflow-hidden px-4 py-3 md:h-40">
        <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap md:text-sm">
          <span ref={textRef} className="text-paper/90" />
          <span
            ref={cursorRef}
            aria-hidden
            className="bg-accent ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em]"
          />
        </pre>
      </div>
    </div>
  )
})

export default CommentTerminal
