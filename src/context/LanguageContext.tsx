"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import en from "@/locales/en.json"
import th from "@/locales/th.json"

type Language = "en" | "th"
type Dictionary = Record<string, string>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const dictionaries: Record<Language, Dictionary> = {
  en,
  th,
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("satarnmath_lang") as Language
    if (savedLang && (savedLang === "en" || savedLang === "th")) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("satarnmath_lang", lang)
  }

  const t = (key: string): string => {
    return dictionaries[language][key] || key
  }

  // We don't need to prevent hydration mismatch by hiding children because
  // the initial state is always "en", matching the server render perfectly.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
