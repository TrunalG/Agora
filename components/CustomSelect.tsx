'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: string[] | { value: string; label: string }[]
  placeholder: string
  className?: string
}

export function CustomSelect({ value, onChange, options, placeholder, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = useMemo(() => {
    if (!value) return placeholder
    const found = options.find((opt) => {
      if (typeof opt === 'string') return opt === value
      return opt.value === value
    })
    if (!found) return placeholder
    return typeof found === 'string' ? found : found.label
  }, [value, options, placeholder])

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 flex items-center justify-between px-3 text-xs bg-card border border-border rounded-lg outline-none focus:ring-1.5 focus:ring-primary/30 cursor-pointer shadow-2xs hover:bg-muted/10 transition-colors"
      >
        <span className={value ? 'text-foreground font-medium' : 'text-muted-foreground'}>{selectedLabel}</span>
        <ChevronDown className={`size-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md animate-in fade-in slide-in-from-top-1.5 duration-100">
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full text-left px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
          >
            {placeholder}
          </button>
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value
            const label = typeof opt === 'string' ? opt : opt.label
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                  value === val
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
