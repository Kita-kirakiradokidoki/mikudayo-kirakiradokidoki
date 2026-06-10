import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SITE_CONFIG } from './site.config'

export type Lang = 'zh' | 'en'
export type Bilingual = { zh: string; en: string }

const STRINGS = SITE_CONFIG.strings

export type StringKey = keyof (typeof STRINGS)['zh']

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: StringKey) => string
  pick: (field: Bilingual) => string
}

const LangContext = createContext<LangContextValue | null>(null)

const STORAGE_KEY = 'nagi-blog-lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' || saved === 'zh' ? saved : 'zh'
    } catch {
      return 'zh'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = STRINGS[lang]['doc.title'] ?? SITE_CONFIG.brand.name
  }, [lang])

  const value: LangContextValue = {
    lang,
    setLang,
    t: (key) => STRINGS[lang][key] ?? key,
    pick: (field) => field[lang],
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
