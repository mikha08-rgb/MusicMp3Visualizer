'use client'

import { CircleDot, Disc3 } from 'lucide-react'

interface VisualizationModePickerProps {
  currentMode: 'rings' | 'spectrum'
  onModeChange: (mode: 'rings' | 'spectrum') => void
}

export default function VisualizationModePicker({
  currentMode,
  onModeChange
}: VisualizationModePickerProps) {
  const modes = [
    { id: 'rings' as const, name: 'Layered Rings', icon: Disc3 },
    { id: 'spectrum' as const, name: 'Circular Spectrum', icon: CircleDot },
  ]

  return (
    <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Visualization</p>
      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs
              ${currentMode === mode.id
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }
            `}
            title={mode.name}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mode.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
