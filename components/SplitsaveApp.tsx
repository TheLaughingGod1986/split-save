'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient, type Expense, type Goal, type ApprovalRequest } from '@/lib/api-client'
import { toast } from '@/lib/toast'

// Dark mode hook
function useDarkMode() {
  const [isDark, setIsDark] = useState(false)
  
  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    // Check localStorage for manual override
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setIsDark(saved === 'true')
    }
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDark
    setIsDark(newMode)
    localStorage.setItem('darkMode', newMode.toString())
    
    // Apply to document
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])
  
  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])
  
  return { isDark, toggleDarkMode }
}
import { ProfileManager } from './ProfileManager'
import PartnershipManager from './PartnershipManager'
import PWAInstallPrompt from './PWAInstallPrompt'
import SafetyPotManager from './SafetyPotManager'
import ContributionManager from './ContributionManager'
import { calculateNextPayday, getNextPaydayDescription, isTodayPayday } from '@/lib/payday-utils'

export function SplitsaveApp() {
  const { user, signOut } = useAuth()
  const { isDark, toggleDarkMode } = useDarkMode()
  const [currentView, setCurrentView] = useState('dashboard')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [profileCompletionShown, setProfileCompletionShown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [partnerships, setPartnerships] = useState<any[]>([])

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

    // Load data from backend - SIMPLIFIED VERSION
  const loadData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading data for user:', user?.id)
      
      // Load only essential data first
      const profileData = await apiClient.get('/auth/profile').catch((err) => {
        console.log('👤 Profile API response:', err)
        return null
      })
      
      setProfile(profileData)
      
      // Load other data with shorter timeouts
      const results = await Promise.allSettled([
        apiClient.get('/expenses').catch((err) => {
          console.log('📊 Expenses API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/goals').catch((err) => {
          console.log('🎯 Goals API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/approvals').catch((err) => {
          console.log('✅ Approvals API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/invite').catch((err) => {
          console.log('🤝 Partnerships API response:', err)
          return { partnerships: [], invitations: [] }
        })
      ])
      
      const [expensesResult, goalsResult, approvalsResult, partnershipsResult] = results
      
      // Handle results safely
      setExpenses(expensesResult.status === 'fulfilled' ? expensesResult.value : [])
      setGoals(goalsResult.status === 'fulfilled' ? goalsResult.value : [])
      setApprovals(approvalsResult.status === 'fulfilled' ? approvalsResult.value : [])
      setPartnerships(partnershipsResult.status === 'fulfilled' ? partnershipsResult.value?.partnerships || [] : [])
      
      console.log('📊 Data loaded successfully')
    } catch (err) {
      setError('Failed to load data')
      toast.error('Failed to load data')
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      // Reset loading state when user is not available
      setLoading(false)
    }
  }, [user?.id]) // Only depend on user ID, not the entire loadData function



  const addExpense = async (expenseData: any) => {
    try {
      const result = await apiClient.post('/expenses', expenseData)
      
      if (result.requiresApproval) {
        const amount = expenseData.amount
        const message = amount > 100 
          ? `Expense of ${currencySymbol}${amount.toFixed(2)} requires partner approval (over ${currencySymbol}100 threshold)`
          : 'Expense requires partner approval'
        
        toast.warning(message, { duration: 5000 })
        setError('') // Clear any previous errors
        
        // Show success message for the approval request
        toast.success('Approval request sent to your partner! They will review and approve/decline your expense.', { duration: 6000 })
        
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      } else {
        toast.success('Expense added successfully!')
        setError('') // Clear any previous errors
        // Refresh expenses
        const expensesData = await apiClient.get('/expenses')
        setExpenses(expensesData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to add shared expenses')
        toast.warning('Partnership required: You need to be connected with a partner to add shared expenses')
      } else {
        setError('Failed to add expense')
        toast.error('Failed to add expense')
      }
      console.error('Add expense error:', err)
    }
  }

  const addGoal = async (goalData: any) => {
    try {
      const result = await apiClient.post('/goals', goalData)
      
      if (result.requiresApproval) {
        toast.warning('Goal requires partner approval')
        setError('') // Clear any previous errors
        
        // Show success message for the approval request
        toast.success('Approval request sent to your partner! They will review and approve/decline your goal.', { duration: 6000 })
        
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      } else {
        toast.success('Goal created successfully!')
        setError('') // Clear any previous errors
        // Refresh goals
        const goalsData = await apiClient.get('/goals')
        setGoals(goalsData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to create shared savings goals')
        toast.warning('Partnership required: You need to be connected with a partner to create shared savings goals')
      } else {
        setError('Failed to add goal')
        toast.error('Failed to add goal')
      }
      console.error('Add goal error:', err)
    }
  }

  const approveRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/approve`, {})
      toast.success('Request approved successfully!')
      
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
      toast.error('Failed to approve request')
      console.error('Approve error:', err)
    }
  }

  const declineRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/decline`, {})
      toast.warning('Request declined')
      
      // Refresh approvals
      const approvalsData = await apiClient.get('/approvals')
      setApprovals(approvalsData)
    } catch (err) {
      setError('Failed to decline request')
      toast.error('Failed to decline request')
      console.error('Decline error:', err)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">SplitSave</h1>
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* PWA Install Button */}
              <button
                onClick={() => {
                  if ((window as any).deferredPrompt) {
                    (window as any).deferredPrompt.prompt()
                  } else {
                    alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
                  }
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Install SplitSave App"
              >
                📱
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Sign out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300 py-2">
              Welcome, {user?.email}
            </div>
            
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors flex items-center"
            >
              <span className="mr-2">
                {isDark ? '☀️' : '🌙'}
              </span>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            
            {/* Mobile PWA Install Button */}
            <button
              onClick={() => {
                if ((window as any).deferredPrompt) {
                  (window as any).deferredPrompt.prompt()
                } else {
                  alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
                }
              }}
              className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors flex items-center"
            >
              <span className="mr-2">📱</span>
              Install App
            </button>
            
            <button
              onClick={signOut}
              className="w-full text-left text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 py-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Navigation - Desktop */}
      <div className="hidden md:block bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="nav-tabs">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('expenses')}
              className={`nav-tab ${currentView === 'expenses' ? 'active' : ''}`}
            >
              Expenses
            </button>
            <button
              onClick={() => setCurrentView('goals')}
              className={`nav-tab ${currentView === 'goals' ? 'active' : ''}`}
            >
              Goals
            </button>
            <button
              onClick={() => setCurrentView('safety-pot')}
              className={`nav-tab ${currentView === 'safety-pot' ? 'active' : ''}`}
            >
              Safety Pot
            </button>
            <button
              onClick={() => setCurrentView('approvals')}
              className={`nav-tab ${currentView === 'approvals' ? 'active' : ''}`}
            >
              Approvals ({approvals.length})
            </button>
            <button
              onClick={() => setCurrentView('partnerships')}
              className={`nav-tab ${currentView === 'partnerships' ? 'active' : ''}`}
            >
              Partnerships ({partnerships.length})
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
            >
              Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <div className="flex space-x-1 px-4 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'expenses', label: 'Expenses', icon: '💰' },
              { id: 'goals', label: 'Goals', icon: '🎯' },
              { id: 'safety-pot', label: 'Safety Pot', icon: '🛡️' },
              { id: 'contributions', label: 'Contributions', icon: '💳' },
              { id: 'approvals', label: 'Approvals', icon: '✅', badge: approvals.length },
              { id: 'partnerships', label: 'Partners', icon: '🤝' },
              { id: 'profile', label: 'Profile', icon: '👤' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="relative">
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {error}
                {error.includes('Partnership required') && (
                  <div className="mt-2 text-sm">
                    <p className="text-red-600 mb-2">
                      SplitSave is designed for couples and partners to manage shared finances together.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => setCurrentView('profile')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
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
                className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
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
            userCountry={profile?.country_code}
          />
        )}
        {currentView === 'safety-pot' && (
          <SafetyPotManager 
            currencySymbol={currencySymbol}
            monthlyExpenses={expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0}
            onUpdate={loadData}
          />
        )}
        {currentView === 'contributions' && (
          <ContributionManager 
            currencySymbol={currencySymbol}
            onUpdate={loadData}
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
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Partnerships Temporarily Disabled
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're fixing some technical issues with the partnerships system. 
              Please check back soon!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Current Status:</strong> You have 1 active partnership with Benjamin Oats
              </p>
            </div>
          </div>
        )}
        {currentView === 'profile' && (
          <ProfileManager onProfileUpdate={(updatedProfile) => {
            setProfile(updatedProfile)
            setProfileCompletionShown(false) // Reset flag when profile is updated
          }} />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden mobile-nav">
        <div className="flex justify-around">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'expenses', label: 'Expenses', icon: '💰' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'safety-pot', label: 'Safety Pot', icon: '🛡️' },
            { id: 'contributions', label: 'Contributions', icon: '💳' },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`mobile-nav-item ${currentView === item.id ? 'active' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Single PWA Install Prompt */}
      <PWAInstallPrompt />
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
  const totalGoals = goals ? goals.reduce((sum, goal) => sum + goal.current_amount, 0) : 0
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        
        {/* PWA Install Button */}
        <button
          onClick={() => {
            if ((window as any).deferredPrompt) {
              (window as any).deferredPrompt.prompt()
            } else {
              alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
            }
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          title="Install SplitSave App"
        >
          <span>📱</span>
          <span>Install App</span>
        </button>
      </div>
      
      {/* Welcome Message - Progressive Disclosure */}
      {profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">Welcome to SplitSave!</h3>
          
          {profileCompletion === 0 && (
            <>
              <p className="text-purple-700 dark:text-purple-300">
                Get started by setting up your profile and creating your first shared expense or savings goal.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Set Up Profile →
                </button>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  Configure your income and personal allowance to get started with shared expenses and savings goals.
                </p>
              </div>
            </>
          )}
          
          {profileCompletion > 0 && profileCompletion < 90 && (
            <>
              <p className="text-purple-700 dark:text-purple-300">
                You're making great progress! Complete your profile setup to unlock all features.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Complete Profile →
                </button>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 mb-1">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
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
              <p className="text-purple-700 dark:text-purple-300">
                Almost there! Just a few more details to complete your profile.
              </p>
              <div className="mt-4">
                <button 
                  onClick={onNavigateToProfile}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Finish Profile →
                </button>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 mb-1">
                    <span>Profile Completion</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100">Profile Complete! 🎉</h3>
              <p className="text-green-700 dark:text-green-300 mt-1">
                Your profile is fully set up. Ready to create your first shared expense or savings goal?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payday Information Section */}
      {profile?.payday && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Next Payday</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {getNextPaydayDescription(profile.payday)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {calculateNextPayday(profile.payday).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {isTodayPayday(profile.payday) && (
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  🎉 Today!
                </div>
              </div>
            )}
          </div>
          
          {/* Payday Reminder */}
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Reminder:</strong> Don't forget to contribute to your shared expenses and savings goals on payday!
            </p>
          </div>
        </div>
      )}

      {/* Partnership Status */}
      {!hasPartnership && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">Partnership Required</h3>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                To use SplitSave's full features, you need to connect with a partner. 
                This enables shared expenses, savings goals, and collaborative financial planning.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Expenses</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currencySymbol}{totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {expenses?.length === 0 ? 'No expenses yet' : `${expenses?.length} shared expense${expenses?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Saved</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currencySymbol}{totalGoals.toFixed(2)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {goals?.length === 0 ? 'No goals yet' : `${goals?.length} active goal${goals?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Goals Progress</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalTarget > 0 ? Math.round((totalGoals / totalTarget) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalTarget > 0 ? 'Target: ' + currencySymbol + totalTarget.toFixed(2) : 'Set your first goal'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Expenses</h3>
          {expenses?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">{currencyEmoji}</div>
              <p className="text-sm">No shared expenses yet</p>
              <p className="text-xs mt-1">Add your first expense to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses?.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">{expense.description}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currencySymbol}{expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Goals</h3>
          {goals?.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-sm">No savings goals yet</p>
              <p className="text-xs mt-1">Create your first goal to start saving</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals?.slice(0, 5).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
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
    description: '',
    amount: '',
    category: '',
    message: ''
  })

  // Check if we have a partnership (expenses array will be null if no partnership)
  const hasPartnership = expenses !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    })
    setFormData({ description: '', amount: '', category: '', message: '' })
    setShowForm(false)
  }

  // If no partnership, show setup message
  if (!hasPartnership) {
    return (
      <div className="space-y-6">
              <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shared Expenses</h2>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-medium text-blue-900 dark:text-blue-100 mb-2">Partnership Required</h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          To add shared expenses, you need to be connected with a partner. 
          This allows you to split costs and track shared financial goals together.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Next steps:</strong>
          </p>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shared Expenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary px-4 py-2"
        >
          {showForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Add New Expense</h3>
            <p className="form-section-subtitle">Create a new shared expense with your partner</p>
          </div>
          
          {/* Approval Threshold Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-amber-600 dark:text-amber-400">ℹ️</div>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Partner Approval:</strong> Expenses over {currencySymbol}100 require your partner's approval before they're added to your shared account. 
                Smaller expenses are added immediately.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
                placeholder="e.g., Groceries, Rent, Utilities"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-input"
                required
              >
                <option value="">Select a category</option>
                <option value="Food & Dining">🍽️ Food & Dining</option>
                <option value="Housing">🏠 Housing</option>
                <option value="Transportation">🚗 Transportation</option>
                <option value="Utilities">⚡ Utilities</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Healthcare">🏥 Healthcare</option>
                <option value="Education">📚 Education</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Insurance">🛡️ Insurance</option>
                <option value="Taxes">💰 Taxes</option>
                <option value="Gifts">🎁 Gifts</option>
                <option value="Personal Care">💄 Personal Care</option>
                <option value="Pets">🐾 Pets</option>
                <option value="Subscriptions">📱 Subscriptions</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message (Optional)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="form-input"
                rows={3}
                placeholder="Add any additional notes about this expense..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {expenses && expenses.length > 0 ? (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Recent Expenses</h3>
            <p className="form-section-subtitle">Your shared expenses with your partner</p>
          </div>
          
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Added by {expense.added_by_user?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{currencySymbol}{expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="form-section">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start by adding your first shared expense with your partner
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Goals View Component
function GoalsView({ goals, onAddGoal, currencySymbol, userCountry }: { goals: Goal[], onAddGoal: (data: any) => void, currencySymbol: string, userCountry?: string }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: '',
    category: '',
    priority: '1',
    message: ''
  })

  const calculateMonthlySavings = () => {
    if (!formData.targetAmount || !formData.targetDate) return ''
    
    const targetAmount = parseFloat(formData.targetAmount)
    const targetDate = new Date(formData.targetDate)
    const today = new Date()
    
    // Calculate months between today and target date
    const monthsDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                      (targetDate.getMonth() - today.getMonth())
    
    if (monthsDiff <= 0) return 'Target date must be in the future'
    
    const monthlyAmount = targetAmount / monthsDiff
    return `${currencySymbol}${monthlyAmount.toFixed(2)} per month`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount)
    })
    setFormData({ name: '', targetAmount: '', targetDate: '', description: '', category: '', priority: '1', message: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary px-4 py-2"
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Create New Savings Goal</h3>
            <p className="form-section-subtitle">Set a financial goal to save towards with your partner</p>
          </div>
          
          {/* Approval Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Partner Approval:</strong> All new savings goals require your partner's approval before they're added to your shared account.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Goal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="e.g., Vacation Fund, New Car, Emergency Fund"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            {/* Monthly Savings Calculation */}
            {formData.targetAmount && formData.targetDate && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-green-600 dark:text-green-400">💡</div>
                  <div className="text-green-800 dark:text-green-400 text-sm">
                    <strong>Monthly Savings Needed:</strong> {calculateMonthlySavings()}
                  </div>
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
                rows={3}
                placeholder="Describe what you're saving for..."
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="form-input"
                required
              >
                <option value="">Select a category</option>
                <option value="Vacation">{userCountry === 'US' ? '🏖️ Vacation' : '🏖️ Holiday'}</option>
                <option value="Vehicle">🚗 Vehicle</option>
                <option value="Home">🏠 Home</option>
                <option value="Emergency Fund">🆘 Emergency Fund</option>
                <option value="Wedding">💒 Wedding</option>
                <option value="Education">📚 Education</option>
                <option value="Investment">📈 Investment</option>
                <option value="Gift">🎁 Gift</option>
                <option value="Technology">💻 Technology</option>
                <option value="Furniture">🪑 Furniture</option>
                <option value="Hobby">🎨 Hobby</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="form-input"
                required
              >
                <option value="1">1 - Highest Priority (Funds allocated first)</option>
                <option value="2">2 - High Priority</option>
                <option value="3">3 - Medium Priority</option>
                <option value="4">4 - Low Priority</option>
                <option value="5">5 - Lowest Priority (Funds allocated last)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message (Optional)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="form-input"
                rows={3}
                placeholder="Add any additional notes about this goal..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {goals && goals.length > 0 ? (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Your Savings Goals</h3>
            <p className="form-section-subtitle">Track your progress towards financial goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{goal.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{goal.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target Date: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="form-section">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No savings goals yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first goal to start saving together
            </p>
          </div>
        </div>
      )}
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
      <div className="form-section">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Pending Approvals</h2>
          <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approvals</h2>
      
      {/* Partner Approval Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Partner Approval Required:</strong> Large expenses and new goals require your partner's approval before they can be added to your shared account.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {approvals.map((approval) => (
          <div key={approval.id} className="form-section">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    approval.request_type === 'expense' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  }`}>
                    {approval.request_type === 'expense' ? '💰 Expense' : '🎯 Goal'}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Requested by {approval.requested_by_user?.name || 'Unknown'}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {approval.request_type === 'expense' ? 'New Expense Request' : 'New Goal Request'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {approval.request_type === 'expense' && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Description:</span> {approval.request_data.description || 'No description'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span> <span className="font-semibold text-lg">{currencySymbol}{approval.request_data.amount?.toFixed(2)}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {approval.request_data.category || 'Uncategorized'}</p>
                      </div>
                    </>
                  )}
                  
                  {approval.request_type === 'goal' && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> {approval.request_data.name || 'No name'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Target Amount:</span> <span className="font-semibold text-lg">{currencySymbol}{approval.request_data.targetAmount?.toFixed(2)}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {approval.request_data.category || 'No category'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Description:</span> {approval.request_data.description || 'No description'}</p>
                        {approval.request_data.targetDate && (
                          <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Target Date:</span> {new Date(approval.request_data.targetDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {approval.message && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Message:</span> {approval.message}
                    </p>
                  </div>
                )}
                
                {/* Approval Status Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Action Required:</strong> Please review this request and either approve or decline it. 
                    {approval.request_type === 'expense' && approval.request_data.amount > 100 && (
                      <span> This expense requires approval because it's over {currencySymbol}100.</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onApprove(approval.id)}
                  className="btn btn-success px-4 py-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(approval.id)}
                  className="btn btn-danger px-4 py-2"
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
