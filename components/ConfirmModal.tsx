'use client'

import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  onConfirm: () => void
  onClose: () => void
}

/**
 * Reusable modal popup matching Agora's modal design with a soft backdrop blur.
 * Replaces native browser alert() and confirm() dialogs.
 */
export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay with Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-2.5">
            {variant === 'danger' || variant === 'warning' ? (
              <div className="size-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-4" />
              </div>
            ) : null}
            <h3 className="text-base font-bold tracking-tight text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Description Body */}
        <div className="py-4 text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${getVariantStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
