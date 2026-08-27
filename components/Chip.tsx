'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ChipProps {
  children: React.ReactNode
  muted?: boolean
  onRemove?: () => void
}

/**
 * Chip component for rendering skill tags with optional removal callback.
 */
export function Chip({ children, muted, onRemove }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        muted ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
      }`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remove skill"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}
