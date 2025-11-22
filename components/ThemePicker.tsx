'use client'

import { themes, type ColorTheme } from '@/lib/themes'
import { Palette } from 'lucide-react'
import { useState } from 'react'

interface ThemePickerProps {
  currentTheme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
}

export default function ThemePicker({ currentTheme, onThemeChange }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3
          transition-all flex items-center gap-2
          ${isOpen ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        aria-label="Theme picker"
      >
        <Palette className="w-4 h-4" />
        <span className="text-xs font-medium">{currentTheme.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Theme selector */}
          <div className="absolute right-0 top-full mt-2 z-20 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-3 min-w-[220px]">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 px-1">Color Theme</p>
            <div className="space-y-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${currentTheme.id === theme.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {/* Color preview */}
                  <div className="flex gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.tertiary }}
                    />
                  </div>

                  <span className="text-xs font-medium flex-1 text-left">{theme.name}</span>

                  {currentTheme.id === theme.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
