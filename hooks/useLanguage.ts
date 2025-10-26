"use client"

import { useState, useEffect } from "react"
import { translations, type Language } from "@/lib/i18n/translations"

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>("ja")

  useEffect(() => {
    // ブラウザの言語設定を取得
    const browserLang = navigator.language.toLowerCase()
    setLanguage("en")
  }, [])

  const t = (key: string, ...args: any[]): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value === "string") {
      // 引数がある場合は置換
      return args.reduce((str, arg, index) => {
        return str.replace(`{${index}}`, arg)
      }, value)
    }

    return key // キーが見つからない場合はキー自体を返す
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ja" ? "en" : "ja"))
  }

  return { language, setLanguage, t, toggleLanguage }
}
