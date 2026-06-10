import type { Bilingual } from '../../i18n'

export type PostDef = {
  id: string
  index: string
  title: Bilingual
  excerpt: Bilingual
  body: Bilingual
  tags: string[]
  date: string
  readTime: string
  hidden?: boolean
}
