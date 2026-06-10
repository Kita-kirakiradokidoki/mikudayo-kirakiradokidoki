import { useRef, useEffect } from 'react'
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../lib/gsap'
import { useLang } from '../i18n'
import { type PostDef } from '../data/posts'
import { ArrowLeft } from 'lucide-react'

export default function PostView({ post, onBack }: { post: PostDef; onBack: () => void }) {
  const { t, pick } = useLang()
  const scope = useRef<HTMLElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [post.id])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const split = SplitText.create('[data-post-title]', { type: 'chars', mask: 'chars' })
      gsap
        .timeline()
        .from(split.chars, { yPercent: 120, duration: 0.9, ease: 'power4.out', stagger: 0.03 })
        .from('[data-post-meta]', { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power3.out' }, '-=0.4')
        .from('[data-post-body]', { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
      return () => split.revert()
    },
    { scope, dependencies: [post.id] },
  )

  return (
    <section ref={scope} className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-3xl px-4 pt-28 pb-16 md:pt-44 md:pb-28">
        <button
          data-post-meta
          onClick={onBack}
          className="text-dim hover:text-accent mb-8 flex items-center gap-2 font-mono text-xs tracking-[0.2em] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t('post.back')}
        </button>

        <div data-post-meta className="flex flex-wrap gap-2 mb-5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="border-accent/30 text-accent inline-block border px-2 py-0.5 font-mono text-[10px] tracking-[0.15em]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          data-post-title
          className="text-3xl font-bold tracking-tight md:text-5xl leading-tight"
        >
          {pick(post.title)}
        </h1>

        <p data-post-meta className="text-dim mt-4 font-mono text-xs tracking-[0.2em]">
          {t('post.published')} {post.date} · {post.readTime}
        </p>

        <div
          data-post-body
          className="border-line mt-10 border-t pt-8"
        >
          <div
            className="prose prose-invert max-w-none leading-relaxed text-sm md:text-base"
            style={{ color: 'var(--color-paper)' }}
          >
            {pick(post.body).split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h2 key={i} className="text-accent mt-8 mb-4 text-lg font-bold tracking-tight md:text-xl">
                    {line.replace(/\*\*/g, '')}
                  </h2>
                )
              }
              if (line.startsWith('```')) return null
              if (line === '') return <br key={i} />
              return (
                <p key={i} className="mb-4 text-paper/85">
                  {line}
                </p>
              )
            })}
          </div>
        </div>

        <button
          data-post-meta
          onClick={onBack}
          className="text-dim hover:text-accent border-line mt-12 flex items-center gap-2 border-t pt-6 font-mono text-xs tracking-[0.2em] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t('post.back')}
        </button>
      </div>
    </section>
  )
}
