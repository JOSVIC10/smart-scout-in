import React from 'react'
import { SoccerPitch } from '../players/SoccerPitch'

interface MiniPitchProps {
  type: 'offensive' | 'defensive' | 'abp-ofensivo' | 'abp-defensivo'
  title: string
  orientation?: 'vertical' | 'horizontal'
}

export function MiniPitch({ type, title, orientation = 'horizontal' }: MiniPitchProps) {
  // Generate some static dots based on the type to make it look realistic
  const getDots = () => {
    switch (type) {
      case 'offensive':
        return [
          { x: 20, y: 50, color: 'bg-red-500' },
          { x: 35, y: 20, color: 'bg-red-500' },
          { x: 35, y: 80, color: 'bg-red-500' },
          { x: 50, y: 50, color: 'bg-red-500' },
          { x: 65, y: 30, color: 'bg-red-500' },
          { x: 65, y: 70, color: 'bg-red-500' },
          { x: 80, y: 50, color: 'bg-red-500' },
          { x: 85, y: 50, color: 'bg-blue-500' },
          { x: 75, y: 30, color: 'bg-blue-500' },
          { x: 75, y: 70, color: 'bg-blue-500' },
          { x: 60, y: 40, color: 'bg-blue-500' },
          { x: 60, y: 60, color: 'bg-blue-500' },
        ]
      case 'defensive':
        return [
          { x: 15, y: 50, color: 'bg-red-500' },
          { x: 25, y: 25, color: 'bg-red-500' },
          { x: 25, y: 75, color: 'bg-red-500' },
          { x: 35, y: 40, color: 'bg-red-500' },
          { x: 35, y: 60, color: 'bg-red-500' },
          { x: 45, y: 50, color: 'bg-red-500' },
          { x: 40, y: 50, color: 'bg-blue-500' },
          { x: 55, y: 30, color: 'bg-blue-500' },
          { x: 55, y: 70, color: 'bg-blue-500' },
          { x: 70, y: 50, color: 'bg-blue-500' },
        ]
      case 'abp-ofensivo':
      case 'abp-defensivo':
        return [
          { x: 85, y: 45, color: 'bg-red-500' },
          { x: 88, y: 55, color: 'bg-red-500' },
          { x: 82, y: 48, color: 'bg-red-500' },
          { x: 84, y: 52, color: 'bg-red-500' },
          { x: 95, y: 2, color: 'bg-red-500' }, 
          { x: 86, y: 46, color: 'bg-blue-500' },
          { x: 89, y: 54, color: 'bg-blue-500' },
          { x: 83, y: 49, color: 'bg-blue-500' },
          { x: 85, y: 53, color: 'bg-blue-500' },
          { x: 92, y: 50, color: 'bg-blue-500' }, 
        ]
      default:
        return []
    }
  }

  const dots = getDots()

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-slate-900/80">
        <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          {title}
        </span>
        <button className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors">
          Detalle
        </button>
      </div>
      <div className="p-2 relative bg-slate-950 flex items-center justify-center">
        <div className="w-full relative shadow-inner">
          <SoccerPitch orientation={orientation}>
            <div className="absolute inset-0 pointer-events-none">
              {dots.map((dot, i) => {
                const left = orientation === 'horizontal' ? dot.x : dot.y
                const top = orientation === 'horizontal' ? dot.y : 100 - dot.x
                
                return (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full border border-white/50 shadow-sm ${dot.color} -translate-x-1/2 -translate-y-1/2`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  />
                )
              })}
              {type.startsWith('abp') && (
                <div 
                  className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full border border-yellow-600 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_4px_rgba(250,204,21,0.5)]"
                  style={{ 
                    left: orientation === 'horizontal' ? '96%' : '2%', 
                    top: orientation === 'horizontal' ? '2%' : '4%' 
                  }}
                />
              )}
            </div>
          </SoccerPitch>
        </div>
      </div>
    </div>
  )
}
