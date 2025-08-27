'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient, type Expense, type Goal, type ApprovalRequest } from '@/lib/api-client'
import { ProfileManager } from './ProfileManager'
import { PartnershipManager } from './PartnershipManager'

export function SplitsaveApp() {
  const { user, signOut } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [profileCompletionShown, setProfileCompletionShown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Currency utility functions
  const getCurrencySymbol = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RUB': '₽',
      'TRY': '₺',
      'BRL': 'R$',
      'MXN': '$',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'UYU': '$',
      'VND': '₫',
      'THB': '฿',
      'MYR': 'RM',
      'SGD': 'S$',
      'HKD': 'HK$',
      'TWD': 'NT$',
      'KRW': '₩',
      'INR': '₹',
      'PKR': '₨',
      'BDT': '৳',
      'LKR': 'Rs',
      'NPR': '₨',
      'MMK': 'K',
      'KHR': '៛',
      'LAK': '₭',
      'MNT': '₮',
      'KZT': '₸',
      'UZS': 'so\'m',
      'GEL': '₾',
      'AMD': '֏',
      'AZN': '₼',
      'BYN': 'Br',
      'MDL': 'L',
      'UAH': '₴',
      'BAM': 'KM',
      'RSD': 'дин',
      'MKD': 'ден',
      'ALL': 'L',
      'KGS': 'с',
      'TJS': 'ЅМ',
      'TMT': 'T',
      'AFN': '؋',
      'IRR': '﷼',
      'IQD': 'ع.د',
      'JOD': 'د.ا',
      'KWD': 'د.ك',
      'LBP': 'ل.ل',
      'OMR': 'ر.ع.',
      'QAR': 'ر.ق',
      'SAR': 'ر.س',
      'SYP': 'ل.س',
      'AED': 'د.إ',
      'YER': 'ر.ي',
      'EGP': 'ج.م',
      'LYD': 'ل.د',
      'TND': 'د.ت',
      'DZD': 'د.ج',
      'MAD': 'د.م.',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'XPF': 'CFP',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh',
      'UGX': 'USh',
      'TZS': 'TSh',
      'ETB': 'Br',
      'GHS': 'GH₵',
      'ZMW': 'ZK',
      'BWP': 'P',
      'NAD': 'N$',
      'SZL': 'E',
      'LSL': 'L',
      'MUR': '₨',
      'SCR': '₨',
      'MVR': 'MVR',
      'BTN': 'Nu.'
    }
    return currencyMap[currency] || currency
  }

  const getCurrencyEmoji = (currency: string) => {
    const emojiMap: { [key: string]: string } = {
      'USD': '💵', // Dollar bill
      'GBP': '💷', // Pound note
      'EUR': '💶', // Euro note
      'CAD': '🇨🇦', // Canadian flag
      'AUD': '🇦🇺', // Australian flag
      'JPY': '💴', // Yen note
      'CHF': '🇨🇭', // Swiss flag
      'SEK': '🇸🇪', // Swedish flag
      'NOK': '🇳🇴', // Norwegian flag
      'DKK': '🇩🇰', // Danish flag
      'PLN': '🇵🇱', // Polish flag
      'CZK': '🇨🇿', // Czech flag
      'HUF': '🇭🇺', // Hungarian flag
      'RON': '🇷🇴', // Romanian flag
      'BGN': '🇧🇬', // Bulgarian flag
      'HRK': '🇭🇷', // Croatian flag
      'RUB': '🇷🇺', // Russian flag
      'TRY': '🇹🇷', // Turkish flag
      'BRL': '🇧🇷', // Brazilian flag
      'MXN': '🇲🇽', // Mexican flag
      'ARS': '🇦🇷', // Argentine flag
      'CLP': '🇨🇱', // Chilean flag
      'COP': '🇨🇴', // Colombian flag
      'PEN': '🇵🇪', // Peruvian flag
      'UYU': '🇺🇾', // Uruguayan flag
      'VND': '🇻🇳', // Vietnamese flag
      'THB': '🇹🇭', // Thai flag
      'MYR': '🇲🇾', // Malaysian flag
      'SGD': '🇸🇬', // Singapore flag
      'HKD': '🇭🇰', // Hong Kong flag
      'TWD': '🇹🇼', // Taiwan flag
      'KRW': '🇰🇷', // South Korean flag
      'INR': '🇮🇳', // Indian flag
      'PKR': '🇵🇰', // Pakistani flag
      'BDT': '🇧🇩', // Bangladeshi flag
      'LKR': '🇱🇰', // Sri Lankan flag
      'NPR': '🇳🇵', // Nepalese flag
      'MMK': '🇲🇲', // Myanmar flag
      'KHR': '🇰🇭', // Cambodian flag
      'LAK': '🇱🇦', // Lao flag
      'MNT': '🇲🇳', // Mongolian flag
      'KZT': '🇰🇿', // Kazakh flag
      'UZS': '🇺🇿', // Uzbek flag
      'GEL': '🇬🇪', // Georgian flag
      'AMD': '🇦🇲', // Armenian flag
      'AZN': '🇦🇿', // Azerbaijani flag
      'BYN': '🇧🇾', // Belarusian flag
      'MDL': '🇲🇩', // Moldovan flag
      'UAH': '🇺🇦', // Ukrainian flag
      'BAM': '🇧🇦', // Bosnian flag
      'RSD': '🇷🇸', // Serbian flag
      'MKD': '🇲🇰', // Macedonian flag
      'ALL': '🇦🇱', // Albanian flag
      'KGS': '🇰🇬', // Kyrgyz flag
      'TJS': '🇹🇯', // Tajik flag
      'TMT': '🇹🇲', // Turkmen flag
      'AFN': '🇦🇫', // Afghan flag
      'IRR': '🇮🇷', // Iranian flag
      'IQD': '🇮🇶', // Iraqi flag
      'JOD': '🇯🇴', // Jordanian flag
      'KWD': '🇰🇼', // Kuwaiti flag
      'LBP': '🇱🇧', // Lebanese flag
      'OMR': '🇴🇲', // Omani flag
      'QAR': '🇶🇦', // Qatari flag
      'SAR': '🇸🇦', // Saudi flag
      'SYP': '🇸🇾', // Syrian flag
      'AED': '🇦🇪', // UAE flag
      'YER': '🇾🇪', // Yemeni flag
      'EGP': '🇪🇬', // Egyptian flag
      'LYD': '🇱🇾', // Libyan flag
      'TND': '🇹🇳', // Tunisian flag
      'DZD': '🇩🇿', // Algerian flag
      'MAD': '🇲🇦', // Moroccan flag
      'XOF': '🇧🇫', // Burkina Faso flag (West African CFA)
      'XAF': '🇨🇲', // Cameroon flag (Central African CFA)
      'XPF': '🇵🇫', // French Polynesia flag (Pacific Franc)
      'ZAR': '🇿🇦', // South African flag
      'NGN': '🇳🇬', // Nigerian flag
      'KES': '🇰🇪', // Kenyan flag
      'UGX': '🇺🇬', // Ugandan flag
      'TZS': '🇹🇿', // Tanzanian flag
      'ETB': '🇪🇹', // Ethiopian flag
      'GHS': '🇬🇭', // Ghanaian flag
      'ZMW': '🇿🇲', // Zambian flag
      'BWP': '🇧🇼', // Botswanan flag
      'NAD': '🇳🇦', // Namibian flag
      'SZL': '🇸🇿', // Swazi flag
      'LSL': '🇱🇸', // Lesotho flag
      'MUR': '🇲🇺', // Mauritian flag
      'SCR': '🇸🇨', // Seychelles flag
      'MVR': '🇲🇻', // Maldivian flag
      'BTN': '🇧🇹'  // Bhutanese flag
    }
    return emojiMap[currency] || '💰' // Fallback to generic money bag
  }

  const currencySymbol = profile?.currency ? getCurrencySymbol(profile.currency) : '$'
  const currencyEmoji = profile?.currency ? getCurrencyEmoji(profile.currency) : '💰'

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [expensesData, goalsData, approvalsData, profileData] = await Promise.all([
          apiClient.get('/expenses').catch((err) => {
            // If no partnership, return null instead of empty array
            if (err.status === 400 && err.message?.includes('partnership')) {
              return null
            }
            return []
          }),
          apiClient.get('/goals').catch((err) => {
            if (err.status === 400 && err.message?.includes('partnership')) {
              return null
            }
            return []
          }),
          apiClient.get('/approvals').catch((err) => {
            if (err.status === 400 && err.message?.includes('partnership')) {
              return null
            }
            return []
          }),
          apiClient.get('/auth/profile').catch(() => null)
        ])
        
        setExpenses(expensesData)
        setGoals(goalsData)
        setApprovals(approvalsData)
        setProfile(profileData)
      } catch (err) {
        setError('Failed to load data')
        console.error('Load data error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const addExpense = async (expenseData: any) => {
    try {
      const result = await apiClient.post('/expenses', expenseData)
      
      if (result.requiresApproval) {
        alert('Expense requires partner approval')
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      } else {
        // Refresh expenses
        const expensesData = await apiClient.get('/expenses')
        setExpenses(expensesData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to add shared expenses')
      } else {
        setError('Failed to add expense')
      }
      console.error('Add expense error:', err)
    }
  }

  const addGoal = async (goalData: any) => {
    try {
      const result = await apiClient.post('/goals', goalData)
      
      if (result.requiresApproval) {
        alert('Goal requires partner approval')
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to create shared savings goals')
      } else {
        setError('Failed to add goal')
      }
      console.error('Add goal error:', err)
    }
  }

  const approveRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/approve`, {})
      
      // Refresh data
      const [expensesData, goalsData, approvalsData] = await Promise.all([
        apiClient.get('/expenses'),
        apiClient.get('/goals'),
        apiClient.get('/approvals')
      ])
      
      setExpenses(expensesData)
      setGoals(goalsData)
      setApprovals(approvalsData)
    } catch (err) {
      setError('Failed to approve request')
      console.error('Approve error:', err)
    }
  }

  const declineRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/decline`, {})
      
      // Refresh approvals
      const approvalsData = await apiClient.get('/approvals')
      setApprovals(approvalsData)
    } catch (err) {
      setError('Failed to decline request')
      console.error('Decline error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">SplitSave</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'expenses'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setCurrentView('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'goals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setCurrentView('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'approvals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approvals ({approvals.length})
            </button>
            <button
              onClick={() => setCurrentView('partnerships')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'partnerships'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Partnerships ({profile?.partnerships?.length || 0})
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              data-view="profile"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'profile'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {error}
                {error.includes('Partnership required') && (
                  <div className="mt-2 text-sm">
                    <p className="text-red-600 mb-2">
                      SplitSave is designed for couples and partners to manage shared finances together.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentView('profile')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Complete Profile First
                      </button>
                      <span className="text-red-500 text-xs self-center">
                        Then connect with your partner
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            expenses={expenses}
            goals={goals}
            onNavigateToProfile={() => setCurrentView('profile')}
            profile={profile}
            profileCompletionShown={profileCompletionShown}
            onProfileCompletionShown={() => setProfileCompletionShown(true)}
            currencySymbol={currencySymbol}
            currencyEmoji={currencyEmoji}
          />
        )}
        {currentView === 'expenses' && (
          <ExpensesView 
            expenses={expenses} 
            onAddExpense={addExpense}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'goals' && (
          <GoalsView 
            goals={goals} 
            onAddGoal={addGoal}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'approvals' && (
          <ApprovalsView 
            approvals={approvals} 
            onApprove={approveRequest}
            onDecline={declineRequest}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'partnerships' && (
          <PartnershipManager />
        )}
        {currentView === 'profile' && (
          <ProfileManager onProfileUpdate={(updatedProfile) => {
            setProfile(updatedProfile)
            setProfileCompletionShown(false) // Reset flag when profile is updated
          }} />
        )}
      </div>
    </div>
  )
}

// Dashboard View Component
function DashboardView({ 
  expenses, 
  goals, 
  onNavigateToProfile, 
  profile, 
  profileCompletionShown,
  onProfileCompletionShown,
  currencySymbol,
  currencyEmoji
}: { 
  expenses: Expense[] | null, 
  goals: Goal[] | null, 
  onNavigateToProfile: () => void,
  profile: any,
  profileCompletionShown: boolean,
  onProfileCompletionShown: () => void,
  currencySymbol: string,
  currencyEmoji: string
}) {
  const totalExpenses = expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0
  const totalGoals = goals ? goals.reduce((sum, goal) => sum + goal.saved_amount, 0) : 0
  const totalTarget = goals ? goals.reduce((sum, goal) => sum + goal.target_amount, 0) : 0

  // Calculate profile completion percentage based on actual profile data
  const calculateProfileCompletion = () => {
    if (!profile) return 0
    
    let completion = 0
    
    // Basic info (30%): name, country, currency
    if (profile.name && profile.country_code && profile.currency) {
      completion += 30
    }
    
    // Financial info (40%): income (required for core functionality)
    if (profile.income && profile.income > 0) {
      completion += 40
    }
    
    // Optional info (30%): payday, personal allowance
    if (profile.payday) completion += 15
    if (profile.personal_allowance !== null && profile.personal_allowance !== undefined) completion += 15
    
    return Math.min(completion, 100)
  }

  const profileCompletion = calculateProfileCompletion()
  const hasData = (expenses && expenses.length > 0) || (goals && goals.length > 0)
  const hasPartnership = expenses !== null && goals !== null

  // Show completion message only once per session
  const shouldShowCompletionMessage = profileCompletion === 100 && !hasData && !profileCompletionShown

  // Use useEffect to handle the completion message display
  useEffect(() => {
    if (shouldShowCompletionMessage && onProfileCompletionShown) {
      onProfileCompletionShown()
    }
  }, [shouldShowCompletionMessage, onProfileCompletionShown])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      
      {/* Welcome Message - Progressive Disclosure */}
      {profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-medium text-purple-900 mb-2">Welcome to SplitSave!</h3>
          
          {profileCompletion === 0 && (
            <>
              <p className="text-purple-700">
                Get started by setting up your profile and creating your first shared expense or savings goal.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                >
                  Set Up Profile →
                </button>
                <p className="text-sm text-purple-600 mt-2">
                  Configure your income and personal allowance to get started with shared expenses and savings goals.
                </p>
              </div>
            </>
          )}
          
          {profileCompletion > 0 && profileCompletion < 90 && (
            <>
              <p className="text-purple-700">
                You're making great progress! Complete your profile setup to unlock all features.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                >
                  Complete Profile →
                </button>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-purple-600 mb-1">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {profileCompletion >= 90 && profileCompletion < 100 && (
            <>
              <p className="text-purple-700">
                Almost there! Just a few more details to complete your profile.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                >
                  Finish Profile →
                </button>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-purple-600 mb-1">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Profile Complete Success Message */}
      {shouldShowCompletionMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900">Profile Complete! 🎉</h3>
              <p className="text-green-700 mt-1">
                Your profile is fully set up. Ready to create your first shared expense or savings goal?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Status */}
      {!hasPartnership && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">Partnership Required</h3>
              <p className="text-blue-700 mt-1">
                To use SplitSave's full features, you need to connect with a partner. 
                This enables shared expenses, savings goals, and collaborative financial planning.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Monthly Expenses</h3>
          <p className="text-3xl font-bold text-purple-600">{currencySymbol}{totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {expenses?.length === 0 ? 'No expenses yet' : `${expenses?.length} shared expense${expenses?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Saved</h3>
          <p className="text-3xl font-bold text-green-600">{currencySymbol}{totalGoals.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {goals?.length === 0 ? 'No goals yet' : `${goals?.length} active goal${goals?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Goals Progress</h3>
          <p className="text-3xl font-bold text-blue-600">
            {totalTarget > 0 ? Math.round((totalGoals / totalTarget) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {totalTarget > 0 ? 'Target: ' + currencySymbol + totalTarget.toFixed(2) : 'Set your first goal'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Expenses</h3>
          {expenses?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">{currencyEmoji}</div>
              <p className="text-sm">No shared expenses yet</p>
              <p className="text-xs mt-1">Add your first expense to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses?.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center">
                  <span className="text-gray-700">{expense.name}</span>
                  <span className="font-medium">{currencySymbol}{expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Goals</h3>
          {goals?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-sm">No savings goals yet</p>
              <p className="text-xs mt-1">Create your first goal to start saving</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals?.slice(0, 5).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{goal.name}</span>
                    <span className="font-medium">
                      {currencySymbol}{goal.saved_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((goal.saved_amount / goal.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Expenses View Component
function ExpensesView({ expenses, onAddExpense, currencySymbol }: { expenses: Expense[] | null, onAddExpense: (data: any) => void, currencySymbol: string }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly'
  })

  // Check if we have a partnership (expenses array will be null if no partnership)
  const hasPartnership = expenses !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    })
    setFormData({ name: '', amount: '', category: '', frequency: 'monthly' })
    setShowForm(false)
  }

  // If no partnership, show setup message
  if (!hasPartnership) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Shared Expenses</h2>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-medium text-blue-900 mb-2">Partnership Required</h3>
          <p className="text-blue-700 mb-4">
            To add shared expenses, you need to be connected with a partner. 
            This allows you to split costs and track shared financial goals together.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-blue-600">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Partner with someone to start sharing expenses</li>
              <li>• Set up shared financial goals</li>
              <li>• Track spending together</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shared Expenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Add Expense
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {expenses?.map((expense) => (
            <li key={expense.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{expense.name}</h3>
                  <p className="text-sm text-gray-500">{expense.category} • {expense.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currencySymbol}{expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    Added by {expense.added_by_user?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Goals View Component
function GoalsView({ goals, onAddGoal, currencySymbol }: { goals: Goal[], onAddGoal: (data: any) => void, currencySymbol: string }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    goalType: '',
    priority: '1'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      priority: parseInt(formData.priority)
    })
    setFormData({ name: '', targetAmount: '', goalType: '', priority: '1' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal Type</label>
              <input
                type="text"
                value={formData.goalType}
                onChange={(e) => setFormData({...formData, goalType: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="1">1 - Highest</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 - Lowest</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Add Goal
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{goal.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{goal.goal_type}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">
                  {currencySymbol}{goal.saved_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((goal.saved_amount / goal.target_amount) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500">
                Priority: {goal.priority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Approvals View Component
function ApprovalsView({ 
  approvals, 
  onApprove, 
  onDecline, 
  currencySymbol 
}: { 
  approvals: ApprovalRequest[], 
  onApprove: (id: string) => void,
  onDecline: (id: string) => void,
  currencySymbol: string
}) {
  if (approvals.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Pending Approvals</h2>
        <p className="text-gray-500">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
      
      <div className="space-y-4">
        {approvals.map((approval) => (
          <div key={approval.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {approval.request_type === 'expense_add' ? 'New Expense' : 'New Goal'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Requested by {approval.requested_by_user?.name || 'Unknown'}
                </p>
                
                <div className="mt-4 space-y-2">
                  {approval.request_type === 'expense_add' && (
                    <>
                      <p><strong>Name:</strong> {approval.request_data.name}</p>
                      <p><strong>Amount:</strong> {currencySymbol}{approval.request_data.amount}</p>
                      <p><strong>Category:</strong> {approval.request_data.category}</p>
                      <p><strong>Frequency:</strong> {approval.request_data.frequency}</p>
                    </>
                  )}
                  
                  {approval.request_type === 'goal_add' && (
                    <>
                      <p><strong>Name:</strong> {approval.request_data.name}</p>
                      <p><strong>Target Amount:</strong> {currencySymbol}{approval.request_data.targetAmount}</p>
                      <p><strong>Goal Type:</strong> {approval.request_data.goalType}</p>
                      <p><strong>Priority:</strong> {approval.request_data.priority}</p>
                    </>
                  )}
                  
                  {approval.message && (
                    <p><strong>Message:</strong> {approval.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onApprove(approval.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(approval.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
