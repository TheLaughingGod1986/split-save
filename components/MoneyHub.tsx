'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import SafetyPotManager from './SafetyPotManager'
import ContributionManager from './ContributionManager'
import { MonthlyProgress } from './MonthlyProgress'

interface MoneyHubProps {
  expenses: any[]
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  onAddExpense: (expense: any) => void
  onUpdate: () => void
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
  onAddExpense,
  onUpdate
}: MoneyHubProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'contributions' | 'safety-pot' | 'analytics'>('expenses')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
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
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'contributions', label: 'Contributions', icon: '📊' },
    { id: 'safety-pot', label: 'Safety Pot', icon: '🛡️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
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
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Food Shopping, Rent, Bills"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount * ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Notes (Optional)
              </label>
              <textarea
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this expense..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
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
            <div key={expense.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                  <div>
                    <h4 className="font-medium">{expense.description}</h4>
                    <p className="text-sm text-gray-500">
                      {getCategoryLabel(expense.category)} • {formatDate(expense.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {currencySymbol}{expense.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Monthly Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Total Expenses</p>
              <p className="text-xl font-bold text-blue-900">
                {currencySymbol}{monthlyExpenses.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Number of Expenses</p>
              <p className="text-xl font-bold text-blue-900">{expenses.length}</p>
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
      onProgressUpdate={(data) => {
        console.log('Monthly progress update:', data)
        onUpdate()
      }}
    />
  )

  const renderSafetyPotTab = () => (
    <SafetyPotManager 
      currencySymbol={currencySymbol}
      monthlyExpenses={monthlyExpenses}
      onUpdate={onUpdate}
    />
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Spending Analytics</h3>
        
        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium">Spending by Category</h4>
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
                      <span className="text-sm">{category.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {currencySymbol}{categoryTotal.toFixed(0)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No expenses to analyze yet</p>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">Monthly Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-green-700 text-sm">Average per Expense</p>
              <p className="text-xl font-bold text-green-900">
                {currencySymbol}{expenses && expenses.length > 0 ? (monthlyExpenses / expenses.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-700 text-sm">Total This Month</p>
              <p className="text-xl font-bold text-blue-900">
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
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Money Management</h1>
        <p className="text-gray-600">Track expenses, record contributions, and manage your safety pot</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
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
