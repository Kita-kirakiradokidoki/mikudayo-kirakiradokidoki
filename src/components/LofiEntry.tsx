import { Disc3 } from 'lucide-react'
import { useLang } from '../i18n'
import { SITE_CONFIG } from '../site.config'
import { withBase } from '../lib/base'

/**
 * Floating bottom-right entry link to the /lofi immersive page.
 * Mounted inside FloatingLayer so it stacks with the other bottom-right
 * widgets (player / Steam / NetEase) without overlapping them.
 */
export default function LofiEntry() {
  const { pick } = useLang()

  if (!SITE_CONFIG.lofi.enabled) return null

  return (
    <a
      href={withBase('/lofi')}
      aria-label={pick({ zh: '自习室', en: 'Lo-fi' })}
      title={pick({ zh: '自习室', en: 'Lo-fi' })}
      className="grid size-11 place-items-center rounded-full border border-ink-2/20 bg-ink/80 text-dim backdrop-blur-md transition-colors hover:border-ink-2/40 hover:text-paper press-sm"
    >
      <Disc3 className="size-5" />
    </a>
  )
}
