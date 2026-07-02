'use client'

import React from 'react'

interface SoccerPitchProps {
  orientation?: 'vertical' | 'horizontal'
  width?: number
  height?: number
  className?: string
  children?: React.ReactNode
}

/**
 * SoccerPitch — Reusable SVG football pitch component.
 * Props:
 *   orientation: 'vertical' (default) | 'horizontal'
 *   width / height: outer dimensions in px (auto-fills container if omitted)
 *   children: overlay slots (heatmap, defensive zones, etc.)
 */
export function SoccerPitch({
  orientation = 'vertical',
  width,
  height,
  className = '',
  children,
}: SoccerPitchProps) {
  // Canonical pitch dimensions (scaled internally)
  // FIFA standard: 105m × 68m
  const PITCH_W = 105
  const PITCH_H = 68

  // For vertical orientation swap the axes so height > width
  const isVertical = orientation === 'vertical'
  const vw = isVertical ? PITCH_H : PITCH_W
  const vh = isVertical ? PITCH_W : PITCH_H

  // SVG viewBox (always draw in landscape, then rotate with transform)
  const vbW = PITCH_W
  const vbH = PITCH_H

  const pitchGreen = '#166534'
  const lineColor = 'rgba(255,255,255,0.85)'
  const lineWidth = 0.5

  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        aspectRatio: isVertical ? `${PITCH_H}/${PITCH_W}` : `${PITCH_W}/${PITCH_H}`,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{
          transform: isVertical ? 'rotate(90deg) scaleX(-1)' : 'none',
          transformOrigin: 'center center',
        }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pitch background with stripes */}
        <defs>
          <pattern id="stripes" patternUnits="userSpaceOnUse" width="10" height={PITCH_H}>
            <rect width="5" height={PITCH_H} fill="#15803d" />
            <rect x="5" width="5" height={PITCH_H} fill="#166534" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={PITCH_W} height={PITCH_H} fill="url(#stripes)" rx="0.5" />

        {/* Outer boundary */}
        <rect
          x="2" y="2"
          width={PITCH_W - 4} height={PITCH_H - 4}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Centre line */}
        <line
          x1={PITCH_W / 2} y1="2"
          x2={PITCH_W / 2} y2={PITCH_H - 2}
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Centre circle (r=9.15m) */}
        <circle
          cx={PITCH_W / 2} cy={PITCH_H / 2}
          r="9.15"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Centre spot */}
        <circle cx={PITCH_W / 2} cy={PITCH_H / 2} r="0.5" fill={lineColor} />

        {/* === LEFT GOAL === */}
        {/* Goal area (5.5m × 18.32m) */}
        <rect
          x="2" y={PITCH_H / 2 - 9.16}
          width="5.5" height="18.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Penalty area (16.5m × 40.32m) */}
        <rect
          x="2" y={PITCH_H / 2 - 20.16}
          width="16.5" height="40.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Penalty spot */}
        <circle cx="13.84" cy={PITCH_H / 2} r="0.5" fill={lineColor} />
        {/* Penalty arc */}
        <path
          d={`M 18.5 ${PITCH_H / 2 - 7.3} A 9.15 9.15 0 0 0 18.5 ${PITCH_H / 2 + 7.3}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Goal posts */}
        <rect
          x="0" y={PITCH_H / 2 - 3.66}
          width="2" height="7.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* === RIGHT GOAL === */}
        {/* Goal area */}
        <rect
          x={PITCH_W - 7.5} y={PITCH_H / 2 - 9.16}
          width="5.5" height="18.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Penalty area */}
        <rect
          x={PITCH_W - 18.5} y={PITCH_H / 2 - 20.16}
          width="16.5" height="40.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Penalty spot */}
        <circle cx={PITCH_W - 13.84} cy={PITCH_H / 2} r="0.5" fill={lineColor} />
        {/* Penalty arc */}
        <path
          d={`M ${PITCH_W - 18.5} ${PITCH_H / 2 - 7.3} A 9.15 9.15 0 0 1 ${PITCH_W - 18.5} ${PITCH_H / 2 + 7.3}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />
        {/* Goal posts */}
        <rect
          x={PITCH_W - 2} y={PITCH_H / 2 - 3.66}
          width="2" height="7.32"
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
        />

        {/* Corner arcs */}
        <path d="M 2 4 A 2 2 0 0 1 4 2" fill="none" stroke={lineColor} strokeWidth={lineWidth} />
        <path d={`M 2 ${PITCH_H - 4} A 2 2 0 0 0 4 ${PITCH_H - 2}`} fill="none" stroke={lineColor} strokeWidth={lineWidth} />
        <path d={`M ${PITCH_W - 4} 2 A 2 2 0 0 1 ${PITCH_W - 2} 4`} fill="none" stroke={lineColor} strokeWidth={lineWidth} />
        <path d={`M ${PITCH_W - 4} ${PITCH_H - 2} A 2 2 0 0 0 ${PITCH_W - 2} ${PITCH_H - 4}`} fill="none" stroke={lineColor} strokeWidth={lineWidth} />
      </svg>

      {/* Children overlays (positioned absolute inside the container) */}
      {children && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  )
}
