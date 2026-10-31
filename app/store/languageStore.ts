'use client'

import { create } from 'zustand'
import { translations, Language, formatI18n } from '../i18n/translations'

interface LanguageState {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
}

const getInitialLang = (): Language => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('rentiq_lang')
      if (saved === 'en' || saved === 'vi') return saved
    } catch {
      // Ignore localStorage errors (e.g. private browsing)
    }
  }
  return 'vi'
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getInitialLang(),
  setLang: (lang: Language) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('rentiq_lang', lang)
      } catch {
        // Ignore
      }
    }
    set({ lang })
  },
  toggleLang: () => {
    set((state) => {
      const nextLang: Language = state.lang === 'vi' ? 'en' : 'vi'
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('rentiq_lang', nextLang)
        } catch {
          // Ignore
        }
      }
      return { lang: nextLang }
    })
  }
}))

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)
  const toggleLang = useLanguageStore((s) => s.toggleLang)
  const strings = translations[lang]

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.')
    let current: any = strings
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return path
      }
    }
    if (typeof current === 'string') {
      return formatI18n(current, params)
    }
    return String(current)
  }

  return { lang, setLang, toggleLang, t, strings }
}
