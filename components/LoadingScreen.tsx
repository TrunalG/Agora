'use client'

import React from 'react'

interface LoadingScreenProps {
  label?: string
  fullScreen?: boolean
}

/**
 * Platform-wide unified loading screen featuring the spinning Agora logo.
 * Matches the landing page loading aesthetic for complete visual consistency.
 */
export function LoadingScreen({ label = 'Loading Agora...', fullScreen = true }: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[100] flex items-center justify-center bg-background text-foreground'
    : 'min-h-[300px] w-full flex items-center justify-center bg-background text-foreground p-8'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <div className="size-16 animate-spin" style={{ animationDuration: '3s' }}>
          <img src="/bg-logo2.png" alt="Agora Logo" className="size-full object-contain" />
        </div>
        <p className="text-xs text-muted-foreground tracking-wider uppercase font-bold">{label}</p>
      </div>
    </div>
  )
}
