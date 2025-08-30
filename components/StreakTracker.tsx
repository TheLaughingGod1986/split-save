'use client'
import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { calculateContributionStreak, StreakData } from '@/lib/achievement-utils'

interface Milestone {
  id: string
  title: string
  description: string
  icon: string
  requirement: number
  achieved: boolean
  achievedAt?: Date
}

export function StreakTracker() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalContributions: 0,
    streakType: 'monthly'
  })
  
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<any[]>([])

  // Load streak data from API
  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    try {
      setLoading(true)
      
      // Get achievements data which includes streak information
      const response = await apiClient.get('/achievements')
      
      if (response.progress) {
        const progress = response.progress
        
        // Calculate streak data from contributions
        const streakInfo = calculateContributionStreak(contributions)
        
        setStreakData({
          currentStreak: progress.current_streak || 0,
          longestStreak: progress.longest_streak || 0,
          totalContributions: progress.total_contributions || 0,
          lastContributionDate: progress.last_updated ? new Date(progress.last_updated).toISOString() : undefined,
          streakType: 'monthly'
        })

        // Initialize milestones based on real data
        const initialMilestones: Milestone[] = [
          {
            id: 'streak-3',
            title: 'Getting Started',
            description: 'Maintain a 3-month streak',
            icon: '🔥',
            requirement: 3,
            achieved: (progress.current_streak || 0) >= 3
          },
          {
            id: 'streak-6',
            title: 'Consistent Saver',
            description: 'Maintain a 6-month streak',
            icon: '🔥🔥',
            requirement: 6,
            achieved: (progress.current_streak || 0) >= 6
          },
          {
            id: 'streak-12',
            title: 'Year of Savings',
            description: 'Maintain a 12-month streak',
            icon: '🔥🔥🔥',
            requirement: 12,
            achieved: (progress.current_streak || 0) >= 12
          },
          {
            id: 'contributions-10',
            title: 'Regular Contributor',
            description: 'Make 10 contributions',
            icon: '💰',
            requirement: 10,
            achieved: (progress.total_contributions || 0) >= 10
          },
          {
            id: 'contributions-25',
            title: 'Dedicated Saver',
            description: 'Make 25 contributions',
            icon: '💰💰',
            requirement: 25,
            achieved: (progress.total_contributions || 0) >= 25
          },
          {
            id: 'contributions-50',
            title: 'Savings Champion',
            description: 'Make 50 contributions',
            icon: '💰💰💰',
            requirement: 50,
            achieved: (progress.total_contributions || 0) >= 50
          }
        ]

        setMilestones(initialMilestones)
      }
    } catch (error) {
      console.error('Error loading streak data:', error)
      toast.error('Failed to load streak data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate streak status
  const getStreakStatus = () => {
    if (!streakData.lastContributionDate) {
      return { status: 'warning', message: 'No contributions yet. Start your savings journey!' }
    }
    
    const daysSinceLastContribution = Math.floor(
      (Date.now() - new Date(streakData.lastContributionDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceLastContribution === 0) {
      return { status: 'on-track', message: 'Great job! You contributed today.' }
    } else if (daysSinceLastContribution <= 7) {
      return { status: 'recent', message: `Last contribution was ${daysSinceLastContribution} day${daysSinceLastContribution > 1 ? 's' : ''} ago.` }
    } else if (daysSinceLastContribution <= 14) {
      return { status: 'warning', message: `It's been ${daysSinceLastContribution} days since your last contribution.` }
    } else {
      return { status: 'danger', message: `It's been ${daysSinceLastContribution} days since your last contribution.` }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 dark:text-green-400'
      case 'recent': return 'text-blue-600 dark:text-blue-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'danger': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'recent': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'danger': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    }
  }

  // Generate streak history for the last 30 days
  const generateStreakHistory = () => {
    const history = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Check if there's a contribution on this date
      const hasContribution = contributions.some(contribution => {
        const contributionDate = new Date(contribution.created_at)
        return contributionDate.toDateString() === date.toDateString()
      })
      
      history.push({
        date: date.toISOString().split('T')[0],
        contributed: hasContribution,
        amount: hasContribution ? 100 : 0 // Default amount for display
      })
    }
    
    return history
  }

  const streakStatus = getStreakStatus()
  const streakHistory = generateStreakHistory()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🔥</span>
            <div>
              <h1 className="text-2xl font-bold">Streak Tracker</h1>
              <p className="text-orange-100">Loading your streak data...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🔥</span>
          <div>
            <h1 className="text-2xl font-bold">Streak Tracker</h1>
            <p className="text-orange-100">Keep your savings momentum going!</p>
          </div>
        </div>
      </div>

      {/* Current Streak Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔥 Current Streak
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {streakData.currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">months</div>
          </div>
          
          {/* Longest Streak */}
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {streakData.longestStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">months</div>
          </div>
          
          {/* Total Contributions */}
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {streakData.totalContributions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">contributions</div>
          </div>
        </div>

        {/* Streak Status */}
        <div className={`mt-6 p-4 rounded-lg border ${getStatusBg(streakStatus.status)}`}>
          <div className="flex items-center space-x-3">
            <span className={`text-2xl ${getStatusColor(streakStatus.status)}`}>
              {streakStatus.status === 'on-track' ? '✅' : 
               streakStatus.status === 'recent' ? '📅' : 
               streakStatus.status === 'warning' ? '⚠️' : '🚨'}
            </span>
            <div>
              <div className={`font-medium ${getStatusColor(streakStatus.status)}`}>
                {streakStatus.message}
              </div>
              {streakData.lastContributionDate && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Last contribution: {new Date(streakData.lastContributionDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Streak Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📅 30-Day Streak Calendar
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showHistory ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {streakHistory.map((day, index) => {
            const date = new Date(day.date)
            const dayOfWeek = date.getDay()
            
            // Add empty cells for proper calendar alignment
            if (index === 0 && dayOfWeek > 0) {
              const emptyCells = []
              for (let i = 0; i < dayOfWeek; i++) {
                emptyCells.push(<div key={`empty-${i}`} className="h-8"></div>)
              }
              return emptyCells
            }
            
            return (
              <div
                key={day.date}
                className={`h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all ${
                  day.contributed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                title={`${day.date}: ${day.contributed ? `Contributed £${day.amount}` : 'No contribution'}`}
              >
                {day.contributed ? '✓' : '·'}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Contributed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">No Contribution</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Streak Milestones
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border transition-all ${
                milestone.achieved
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{milestone.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    milestone.achieved 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {milestone.title}
                  </h3>
                  <p className={`text-sm ${
                    milestone.achieved 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {milestone.description}
                  </p>
                </div>
                <div className={`text-sm font-bold ${
                  milestone.achieved 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {milestone.achieved ? '✓' : milestone.requirement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation & Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
          💡 Tips to Keep Your Streak Alive
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">💪</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Set monthly reminders</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">🎯</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Automate contributions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">📱</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Use mobile notifications</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">🤝</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Partner accountability</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">📊</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Track your progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 dark:text-blue-400">🏆</span>
              <span className="text-blue-800 dark:text-blue-200 text-sm">Celebrate milestones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Your Next Goal
        </h2>
        
        {(() => {
          const nextMilestone = milestones.find(m => !m.achieved)
          if (!nextMilestone) {
            return (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Congratulations!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You've achieved all streak milestones!
                </p>
              </div>
            )
          }
          
          const progress = nextMilestone.id.includes('streak') 
            ? (streakData.currentStreak / nextMilestone.requirement) * 100
            : (streakData.totalContributions / nextMilestone.requirement) * 100
          
          return (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{nextMilestone.icon}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {nextMilestone.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {nextMilestone.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {nextMilestone.id.includes('streak') ? streakData.currentStreak : streakData.totalContributions}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    / {nextMilestone.requirement}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% complete
              </div>
            </div>
          )
        })()}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadStreakData}
          className="px-6 py-2 bg-orange-600 text-white rounded-full font-medium hover:bg-orange-700 transition-colors"
        >
          🔄 Refresh Streak Data
        </button>
      </div>
    </div>
  )
}
