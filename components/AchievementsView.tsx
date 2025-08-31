import React from 'react'
import { AchievementSystem } from './AchievementSystem'

interface AchievementsViewProps {
  profile: any
  partnerships: any[]
  goals: any[]
  currencySymbol: string
}

export function AchievementsView({ profile, partnerships, goals, currencySymbol }: AchievementsViewProps) {
  // Use our comprehensive AchievementSystem instead of the basic one
  return <AchievementSystem />
}