'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { AchievementsView } from './AchievementsView'
import { GoalPrioritizationEngine, GoalPriority } from '@/lib/goal-prioritization'
import { GoalRecommendations } from './GoalRecommendations'
import { GoalAllocationView } from './GoalAllocationView'

interface GoalsHubProps {
  goals: any[]
  partnerships: any[]
  profile: any
  partnerProfile: any
  user: any
  currencySymbol: string
  onAddGoal: (goal: any) => void
  onUpdateGoal?: (goalId: string, updates: any) => void
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
  onAddGoal,
  onUpdateGoal
}: GoalsHubProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'prioritization' | 'completed' | 'achievements'>('active')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    name?: string
    targetAmount?: string
    currentAmount?: string
    targetDate?: string
    category?: string
    description?: string
  }>({})
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'vacation',
    description: '',
    priority: GoalPriority.MEDIUM
  })

  // Prioritization state
  const [showPrioritization, setShowPrioritization] = useState(false)
  const [prioritizationEngine, setPrioritizationEngine] = useState<GoalPrioritizationEngine | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [allocations, setAllocations] = useState<any[]>([])

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
    console.log('🎯 GoalsHub - Received goals data:', goals)
    if (!goals) return { activeGoals: [], completedGoals: [] }
    
    const active = goals.filter(goal => goal.current_amount < goal.target_amount)
    const completed = goals.filter(goal => goal.current_amount >= goal.target_amount)
    
    console.log('🎯 GoalsHub - Active goals:', active)
    console.log('🎯 GoalsHub - Completed goals:', completed)
    
    return { activeGoals: active, completedGoals: completed }
  }, [goals])

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!goals || goals.length === 0) return 0
    
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
    
    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  }, [goals])

  // Initialize prioritization engine
  useEffect(() => {
    if (goals && profile) {
      const monthlyIncome = profile.monthly_income || 0
      const engine = new GoalPrioritizationEngine(goals, monthlyIncome)
      setPrioritizationEngine(engine)
      
      // Calculate recommendations and allocations
      const recs = engine.generateRecommendations()
      const allocs = engine.calculateOptimalAllocations()
      
      setRecommendations(recs)
      setAllocations(allocs)
    }
  }, [goals, profile])

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
        current_amount: 0, // Initialize with 0 for new goals
        target_date: goalForm.targetDate,
        category: goalForm.category,
        description: goalForm.description.trim(),
        priority: goalForm.priority
      }

      await onAddGoal(goal)
      
      // Reset form
      setGoalForm({
        name: '',
        targetAmount: '',
        targetDate: '',
        category: 'vacation',
        description: '',
        priority: GoalPriority.MEDIUM
      })
      setShowAddGoal(false)
      
      toast.success('Goal created successfully!')
    } catch (error) {
      console.error('Failed to add goal:', error)
      toast.error('Failed to create goal')
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal.id)
    setEditForm({
      name: goal.name,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      targetDate: goal.target_date,
      category: goal.category,
      description: goal.description || ''
    })
  }

  const handleUpdateGoal = async () => {
    if (!editingGoal || !onUpdateGoal) return

    try {
      const updates = {
        name: editForm.name?.trim() || '',
        target_amount: parseFloat(editForm.targetAmount || '0'),
        current_amount: parseFloat(editForm.currentAmount || '0'),
        target_date: editForm.targetDate || '',
        category: editForm.category || 'other',
        description: editForm.description?.trim() || ''
      }

      await onUpdateGoal(editingGoal, updates)
      setEditingGoal(null)
      setEditForm({})
      toast.success('Goal updated successfully!')
    } catch (error) {
      console.error('Failed to update goal:', error)
      toast.error('Failed to update goal')
    }
  }

  const handleCancelEdit = () => {
    setEditingGoal(null)
    setEditForm({})
  }

  const handleApplyRecommendation = async (goalId: string, type: string, value: any) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal || !onUpdateGoal) return

      let updates: any = {}
      
      switch (type) {
        case 'amount':
          updates.target_amount = value
          break
        case 'deadline':
          updates.target_date = value
          break
        case 'priority':
          updates.priority = value
          break
        case 'contribution':
          // This would update user's savings rate - handled separately
          toast.success('Consider updating your monthly savings rate in profile settings')
          return
      }

      await onUpdateGoal(goalId, updates)
      toast.success('Recommendation applied successfully!')
      
      // Refresh recommendations
      if (prioritizationEngine) {
        const recs = prioritizationEngine.generateRecommendations()
        setRecommendations(recs)
      }
    } catch (error) {
      console.error('Failed to apply recommendation:', error)
      toast.error('Failed to apply recommendation')
    }
  }

  const handleDismissRecommendation = (goalId: string, type: string) => {
    setRecommendations(prev => prev.filter(r => !(r.goalId === goalId && r.type === type)))
  }

  const handleUpdateAllocation = async (goalId: string, allocation: number) => {
    try {
      if (!onUpdateGoal) return
      
      await onUpdateGoal(goalId, { allocation_percentage: allocation })
      toast.success('Allocation updated successfully!')
      
      // Refresh allocations
      if (prioritizationEngine) {
        const allocs = prioritizationEngine.calculateOptimalAllocations()
        setAllocations(allocs)
      }
    } catch (error) {
      console.error('Failed to update allocation:', error)
      toast.error('Failed to update allocation')
    }
  }

  const getContributionPercentage = (current: number, target: number, income: number) => {
    if (!income || income <= 0) return 0
    const monthlyContribution = current / Math.max(1, (new Date().getMonth() + 1))
    return (monthlyContribution / income) * 100
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100)
  }

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { value: Math.abs(diffDays), unit: 'days', text: 'Overdue' }
    }
    
    if (diffDays >= 365) {
      const months = Math.floor(diffDays / 30.44)
      return { value: months, unit: 'months', text: `${months} month${months !== 1 ? 's' : ''} left` }
    } else if (diffDays >= 30) {
      const weeks = Math.floor(diffDays / 7)
      return { value: weeks, unit: 'weeks', text: `${weeks} week${weeks !== 1 ? 's' : ''} left` }
    } else {
      return { value: diffDays, unit: 'days', text: `${diffDays} day${diffDays !== 1 ? 's' : ''} left` }
    }
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
    { id: 'prioritization', label: 'Prioritization', icon: '📊', count: recommendations.length },
    { id: 'completed', label: 'Completed', icon: '🏆', count: completedGoals.length },
    { id: 'achievements', label: 'Achievements', icon: '🏅', count: 0 }
  ]

  const renderActiveGoals = () => (
    <div className="space-y-4">
      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-heading-3 text-gray-900 dark:text-white">Active Savings Goals</h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="btn-primary"
        >
          <span>+</span>
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="card space-card">
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Goal Name *
              </label>
              <input
                type="text"
                value={goalForm.name}
                onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Holiday Fund, New Car, Emergency Fund"
                className="input"
                required
              />
            </div>

            <div>
              <label className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Target Amount * ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="0.00"
                className="input"
                required
              />
            </div>

            <div>
              <label className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Target Date *
              </label>
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </div>

            <div>
              <label className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Category
              </label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Priority
              </label>
              <select
                value={goalForm.priority}
                onChange={(e) => setGoalForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="input"
              >
                <option value={GoalPriority.CRITICAL}>🔥 Critical - Must achieve</option>
                <option value={GoalPriority.HIGH}>⭐ High - Very important</option>
                <option value={GoalPriority.MEDIUM}>📊 Medium - Important</option>
                <option value={GoalPriority.LOW}>💭 Low - Nice to have</option>
                <option value={GoalPriority.OPTIONAL}>🤔 Optional - Future consideration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're saving for..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
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
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
            const timeRemaining = getTimeRemaining(goal.target_date)
            
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                {editingGoal === goal.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-purple-600">Edit Goal</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateGoal}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount ({currencySymbol})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.targetAmount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Amount ({currencySymbol})</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.currentAmount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                        <input
                          type="date"
                          value={editForm.targetDate}
                          onChange={(e) => setEditForm(prev => ({ ...prev, targetDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Real-time Preview */}
                    {editForm.currentAmount && editForm.targetAmount && profile?.income && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
                        <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📊 Live Preview</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Progress:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {Math.min(100, (parseFloat(editForm.currentAmount || '0') / parseFloat(editForm.targetAmount || '1')) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Monthly Contribution %:</span>
                            <span className="ml-2 font-semibold text-purple-600 dark:text-purple-400">
                              {getContributionPercentage(parseFloat(editForm.currentAmount || '0'), parseFloat(editForm.targetAmount || '1'), profile.income).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {currencySymbol}{Math.max(0, parseFloat(editForm.targetAmount || '0') - parseFloat(editForm.currentAmount || '0')).toFixed(0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Of Income:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {currencySymbol}{parseFloat(editForm.currentAmount || '0').toFixed(0)} / {currencySymbol}{parseFloat(editForm.targetAmount || '0').toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{categoryInfo.icon}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h4>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{categoryInfo.label}</p>
                            {goal.priority && (
                              <>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${GoalPrioritizationEngine.getPriorityInfo(goal.priority).bgColor} ${GoalPrioritizationEngine.getPriorityInfo(goal.priority).color}`}>
                                  {GoalPrioritizationEngine.getPriorityInfo(goal.priority).label}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {currencySymbol}{goal.current_amount.toFixed(0)} / {currencySymbol}{goal.target_amount.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {progressPercentage.toFixed(0)}% complete
                          </p>
                          {profile?.income && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              {getContributionPercentage(goal.current_amount, goal.target_amount, profile.income).toFixed(1)}% of income
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          title="Edit goal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar - Show only in view mode */}
                {editingGoal !== goal.id && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
                )}

                {/* Goal Details - Show only in view mode */}
                {editingGoal !== goal.id && (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-4">
                        <span>📅 {formatDate(goal.target_date)}</span>
                        <span className={`${timeRemaining.value < 30 && timeRemaining.unit === 'days' ? 'text-red-600 dark:text-red-400' : timeRemaining.value < 90 && timeRemaining.unit === 'days' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                          {timeRemaining.text}
                        </span>
                      </div>
                      <span>
                        {currencySymbol}{(goal.target_amount - goal.current_amount).toFixed(0)} to go
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {goal.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No active goals yet</h3>
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Goals 🎉</h3>
      
      {completedGoals.length > 0 ? (
        <div className="space-y-4">
          {completedGoals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            
            return (
              <div key={goal.id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{categoryInfo.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">{goal.name}</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Completed on {formatDate(goal.updated_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">
                      {currencySymbol}{goal.target_amount.toFixed(0)}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">🏆 Goal Achieved!</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
              ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No completed goals yet</h3>
            <p className="text-sm">Complete your first goal to see it here!</p>
          </div>
        )}
    </div>
  )

  const renderPrioritization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goal Prioritization</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Smart recommendations to optimize your savings strategy
        </p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <GoalRecommendations
            recommendations={recommendations}
            goals={goals}
            onApplyRecommendation={handleApplyRecommendation}
            onDismissRecommendation={handleDismissRecommendation}
          />
        </div>
      )}

      {/* Allocations */}
      <GoalAllocationView
        allocations={allocations}
        goals={goals}
        onUpdateAllocation={handleUpdateAllocation}
      />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
          {activeTab === 'prioritization' && renderPrioritization()}
          {activeTab === 'completed' && renderCompletedGoals()}
          {activeTab === 'achievements' && renderAchievements()}
        </div>
      </div>
    </div>
  )
}
