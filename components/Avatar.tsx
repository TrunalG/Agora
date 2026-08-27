'use client'

import React from 'react'
import type { Person } from '@/lib/prototype-utils'

interface AvatarProps {
  person?: Partial<Person>
  large?: boolean
}

/**
 * Avatar component displaying user profile picture with initials fallback styling.
 */
export function Avatar({ person, large }: AvatarProps) {
  const initials = person?.initials || (person?.name ? person.name.slice(0, 2).toUpperCase() : 'U')
  const tone = person?.tone || 'bg-accent text-accent-foreground'

  if (person?.image) {
    return (
      <div className={`overflow-hidden rounded-full border border-border bg-card shrink-0 ${large ? 'size-16 sm:size-20' : 'size-9'}`}>
        <img src={person.image} alt={person.name || 'User'} className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center font-semibold rounded-full border border-border shrink-0 ${tone} ${
        large ? 'size-16 sm:size-20 text-xl' : 'size-9 text-xs'
      }`}
    >
      {initials}
    </div>
  )
}
