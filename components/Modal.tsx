'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: React.ReactNode
  close: () => void
}

/**
 * Modal dialog component rendering an accessible backdrop and content dialog.
 */
export function Modal({ title, children, close }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={close} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            onClick={close}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-4 max-h-[80vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  )
}
