'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { AchievementsView } from './AchievementsView'

interface GoalsHubProps {
  goals: any[]
  partnerships: any[]
  profile: any
  partnerProfile: any
  user: any
  currencySymbol: string
  onAddGoal: (goal: any) => void
}

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  category: string
  description?: string
  created_at: string
  updated_at: string
}

export function GoalsHub({
  goals,
  partnerships,
  profile,
  partnerProfile,
  user,
  currencySymbol,
  onAddGoal
}: GoalsHubProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'achievements'>('active')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'vacation',
    description: ''
  })

  const categories = [
    { value: 'vacation', label: 'Vacation', icon: '🏖️', color: 'blue' },
    { value: 'emergency', label: 'Emergency Fund', icon: '🛡️', color: 'green' },
    { value: 'house', label: 'House Deposit', icon: '🏠', color: 'purple' },
    { value: 'car', label: 'Car', icon: '🚗', color: 'red' },
    { value: 'wedding', label: 'Wedding', icon: '💒', color: 'pink' },
    { value: 'education', label: 'Education', icon: '🎓', color: 'indigo' },
    { value: 'retirement', label: 'Retirement', icon: '🏖️', color: 'orange' },
    { value: 'gadgets', label: 'Gadgets', icon: '📱', color: 'gray' },
    { value: 'other', label: 'Other', icon: '🎯', color: 'gray' }
  ]

  // Separate active and completed goals
  const { activeGoals, completedGoals } = useMemo(() => {
    if (!goals) return { activeGoals: [], completedGoals: [] }
    
    const active = goals.filter(goal => goal.current_amount < goal.target_amount)
    const completed = goals.filter(goal => goal.current_amount >= goal.target_amount)
    
    return { activeGoals: active, completedGoals: completed }
  }, [goals])

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!goals || goals.length === 0) return 0
    
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
    
    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  }, [goals])

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!goalForm.name.trim() || !goalForm.targetAmount || !goalForm.targetDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const goal = {
        name: goalForm.name.trim(),
        target_amount: parseFloat(goalForm.targetAmount),
        target_date: goalForm.targetDate,
        category: goalForm.category,
        description: goalForm.description.trim()
      }

      await onAddGoal(goal)
      
      // Reset form
      setGoalForm({
        name: '',
        targetAmount: '',
        targetDate: '',
        category: 'vacation',
        description: ''
      })
      setShowAddGoal(false)
      
      toast.success('Goal created successfully!')
    } catch (error) {
      console.error('Failed to add goal:', error)
      toast.error('Failed to create goal')
    }
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100)
  }

  const getDaysRemaining = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1]
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'green'
    if (percentage >= 50) return 'blue'
    if (percentage >= 25) return 'yellow'
    return 'red'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const tabs = [
    { id: 'active', label: 'Active Goals', icon: '🎯', count: activeGoals.length },
    { id: 'completed', label: 'Completed', icon: '🏆', count: completedGoals.length },
    { id: 'achievements', label: 'Achievements', icon: '🏅', count: 0 }
  ]

  const renderActiveGoals = () => (
    <div className="space-y-4">
      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Savings Goals</h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name *
              </label>
              <input
                type="text"
                value={goalForm.name}
                onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Holiday Fund, New Car, Emergency Fund"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount * ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date *
              </label>
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're saving for..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            const progressPercentage = getProgressPercentage(goal)
            const progressColor = getProgressColor(progressPercentage)
            const daysRemaining = getDaysRemaining(goal.target_date)
            
            return (
              <div key={goal.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{categoryInfo.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold">{goal.name}</h4>
                      <p className="text-sm text-gray-500">{categoryInfo.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {currencySymbol}{goal.current_amount.toFixed(0)} / {currencySymbol}{goal.target_amount.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {progressPercentage.toFixed(0)}% complete
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        progressColor === 'green' ? 'bg-green-500' :
                        progressColor === 'blue' ? 'bg-blue-500' :
                        progressColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>📅 {formatDate(goal.target_date)}</span>
                    <span className={`${daysRemaining < 30 ? 'text-red-600' : daysRemaining < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                  </div>
                  <span>
                    {currencySymbol}{(goal.target_amount - goal.current_amount).toFixed(0)} to go
                  </span>
                </div>

                {goal.description && (
                  <p className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    {goal.description}
                  </p>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">No active goals yet</h3>
            <p className="text-sm mb-4">Create your first savings goal to get started</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderCompletedGoals = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Completed Goals 🎉</h3>
      
      {completedGoals.length > 0 ? (
        <div className="space-y-4">
          {completedGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            
            return (
              <div key={goal.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{categoryInfo.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-900">{goal.name}</h4>
                      <p className="text-sm text-green-700">
                        Completed on {formatDate(goal.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-900">
                      {currencySymbol}{goal.target_amount.toFixed(0)}
                    </p>
                    <p className="text-sm text-green-700">🏆 Goal Achieved!</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium mb-2">No completed goals yet</h3>
          <p className="text-sm">Complete your first goal to see it here!</p>
        </div>
      )}
    </div>
  )

  const renderAchievements = () => (
    <AchievementsView 
      partnerships={partnerships}
      profile={profile}
      goals={goals}
      currencySymbol={currencySymbol}
    />
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Overall Progress */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Savings Goals</h1>
        <p className="text-purple-100 mb-4">Track your savings progress and achieve your dreams</p>
        
        {goals && goals.length > 0 && (
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Overall Progress</span>
              <span className="text-sm font-semibold">{overallProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'active' && renderActiveGoals()}
          {activeTab === 'completed' && renderCompletedGoals()}
          {activeTab === 'achievements' && renderAchievements()}
        </div>
      </div>
    </div>
  )
}
