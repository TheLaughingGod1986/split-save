'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { EnhancedSafetyPot } from './EnhancedSafetyPot'
import ContributionManager from '../forms/ContributionManager'
import { MonthlyProgress } from './MonthlyProgress'

interface MoneyHubProps {
  expenses: any[]
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  goals?: any[]
  monthlyProgress?: any
  onAddExpense: (expense: any) => void
  onUpdate: () => void
  navigationParams?: any
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  created_at: string
  user_id: string
  partnership_id: string
  due_date?: string
}

export function MoneyHub({
  expenses,
  partnerships,
  profile,
  user,
  currencySymbol,
  goals = [],
  monthlyProgress,
  onAddExpense,
  onUpdate,
  navigationParams
}: MoneyHubProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'contributions' | 'safety-pot' | 'analytics'>(
    navigationParams?.initialTab || 'expenses'
  )
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'general',
    notes: ''
  })
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: 'general',
    notes: ''
  })

  const monthlyExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0

  const categories = [
    { value: 'groceries', label: 'Groceries', icon: '🛒' },
    { value: 'rent', label: 'Rent/Mortgage', icon: '🏠' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'dining', label: 'Dining Out', icon: '🍽️' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'general', label: 'General', icon: '📝' }
  ]

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expenseForm.description.trim() || !expenseForm.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const expense = {
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        notes: expenseForm.notes.trim()
      }

      await onAddExpense(expense)
      
      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        category: 'general',
        notes: ''
      })
      setShowAddExpense(false)
      
      toast.success('Expense added successfully!')
    } catch (error) {
      console.error('Failed to add expense:', error)
      toast.error('Failed to add expense')
    }
  }

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editForm.description.trim() || !editForm.amount || !editingExpense) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const updatedExpense = {
        description: editForm.description.trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        notes: editForm.notes.trim()
      }

      const response = await apiClient.updateExpense(editingExpense, updatedExpense)
      
      if (response.requiresApproval) {
        toast.info('Expense update requires partner approval')
      } else {
        toast.success('Expense updated successfully!')
        onUpdate() // Refresh the data
      }
      
      // Reset editing state
      setEditingExpense(null)
      setEditForm({
        description: '',
        amount: '',
        category: 'general',
        notes: ''
      })
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error('Failed to update expense')
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await apiClient.deleteExpense(expenseId)
      
      if (response.requiresApproval) {
        toast.info('Expense deletion requires partner approval')
      } else {
        toast.success('Expense deleted successfully!')
        onUpdate() // Refresh the data
      }
      
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const startEditExpense = (expense: any) => {
    setEditingExpense(expense.id)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      notes: expense.notes || ''
    })
  }

  const cancelEdit = () => {
    setEditingExpense(null)
    setEditForm({
      description: '',
      amount: '',
      category: 'general',
      notes: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.icon || '📝'
  }

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.label || 'General'
  }

  const tabs = [
    { id: 'expenses', label: 'Expenses', shortLabel: 'Expenses', icon: '💰' },
    { id: 'contributions', label: 'Contributions', shortLabel: 'Contrib', icon: '📊' },
    { id: 'safety-pot', label: 'Safety Pot', shortLabel: 'Safety', icon: '🛡️' },
    { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: '📈' }
  ]

  const renderExpensesTab = () => (
    <div className="space-y-4">
      {/* Add Expense Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shared Expenses</h3>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Food Shopping, Rent, Bills"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount * ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this expense..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Expense
              </button>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses && expenses.length > 0 ? (
          expenses.map((expense) => (
            <div key={expense.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              {editingExpense === expense.id ? (
                /* Edit Form */
                <form onSubmit={handleEditExpense} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount * ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.amount}
                        onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional notes..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Display Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{expense.description}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getCategoryLabel(expense.category)} • {formatDate(expense.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currencySymbol}{expense.amount.toFixed(2)}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditExpense(expense)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(expense.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No expenses yet</h3>
            <p className="text-sm mb-4">Start by adding your first shared expense</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </button>
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      {expenses && expenses.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Monthly Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 dark:text-blue-300">Total Expenses</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {currencySymbol}{monthlyExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-blue-700 dark:text-blue-300">Number of Expenses</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{expenses.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderContributionsTab = () => (
    <MonthlyProgress 
      partnerships={partnerships}
      profile={profile}
      user={user}
      currencySymbol={currencySymbol}
      goals={goals}
      onProgressUpdate={(data) => {
        console.log('Monthly progress update:', data)
        onUpdate()
      }}
    />
  )

  const renderSafetyPotTab = () => (
    <EnhancedSafetyPot 
      profile={profile}
      partnerships={partnerships}
      expenses={expenses}
      currencySymbol={currencySymbol}
      onSafetyPotUpdate={(amount) => {
        // Log the update but don't trigger full data refresh
        console.log('Enhanced safety pot updated:', amount)
        // Note: No need to call onUpdate() since the component updates its own state
      }}
    />
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending Analytics</h3>
        
        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Spending by Category</h4>
          {expenses && expenses.length > 0 ? (
            <div className="space-y-2">
              {categories.map(category => {
                const categoryExpenses = expenses.filter(exp => exp.category === category.value)
                const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                const percentage = monthlyExpenses > 0 ? (categoryTotal / monthlyExpenses) * 100 : 0
                
                if (categoryTotal === 0) return null

                return (
                  <div key={category.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span className="text-sm text-gray-900 dark:text-white">{category.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right text-gray-900 dark:text-white">
                        {currencySymbol}{categoryTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No expenses to analyze yet</p>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="mt-6">
          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Monthly Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-300 text-sm">Average per Expense</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">
                {currencySymbol}{expenses && expenses.length > 0 ? (monthlyExpenses / (expenses.length || 1)).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 text-sm">Total This Month</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {currencySymbol}{monthlyExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Expense</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
                {expenses.find(e => e.id === showDeleteConfirm)?.amount > 100 && (
                  <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                    ⚠️ This expense is over {currencySymbol}100 and may require partner approval to delete.
                  </span>
                )}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteExpense(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Money Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Track expenses, record contributions, and manage your safety pot</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto px-2 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'expenses' && renderExpensesTab()}
          {activeTab === 'contributions' && renderContributionsTab()}
          {activeTab === 'safety-pot' && renderSafetyPotTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  )
}
