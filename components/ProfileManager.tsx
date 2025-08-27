'use client'

import { useState, useEffect } from 'react'
import { apiClient, type UserProfile } from '@/lib/api-client'

interface ProfileFormData {
  name: string
  income: string
  payday: string
  personalAllowance: string
  currency: string
  countryCode: string
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
]

const countryCodes = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
]

const paydayOptions = [
  { value: '1', label: '1st of month' },
  { value: '15', label: '15th of month' },
  { value: 'last-friday', label: 'Last Friday of month' },
  { value: 'last-working-day', label: 'Last working day of month' },
  { value: 'custom', label: 'Custom date' },
]

export function ProfileManager({ onProfileUpdate }: { onProfileUpdate?: (profile: UserProfile) => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCustomPayday, setShowCustomPayday] = useState(false)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    income: '',
    payday: '',
    personalAllowance: '',
    currency: 'USD',
    countryCode: 'US'
  })

  // Load profile data
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileData = await apiClient.get('/auth/profile')
      console.log('Loaded profile data:', profileData)
      console.log('Personal allowance from API:', profileData.personal_allowance)
      
      setProfile(profileData)
      
      // Populate form with existing data
      setFormData({
        name: profileData.name || '',
        income: profileData.income?.toString() || '',
        payday: profileData.payday || '',
        personalAllowance: profileData.personal_allowance?.toString() || '',
        currency: profileData.currency || 'USD',
        countryCode: profileData.country_code || 'US'
      })
      
      console.log('Form data after population:', {
        personalAllowance: profileData.personal_allowance?.toString() || ''
      })
      
      // If no currency is set but country is, auto-set the currency
      if (!profileData.currency && profileData.country_code) {
        const selectedCountry = countryCodes.find(c => c.code === profileData.country_code)
        if (selectedCountry) {
          setFormData(prev => ({ ...prev, currency: selectedCountry.currency }))
        }
      }
      
      // Show custom payday input if custom is selected
      if (profileData.payday && !paydayOptions.find(opt => opt.value === profileData.payday)) {
        setShowCustomPayday(true)
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error('Load profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updates = {
        name: formData.name,
        income: formData.income ? parseFloat(formData.income) : null,
        payday: formData.payday,
        personal_allowance: formData.personalAllowance ? parseFloat(formData.personalAllowance) : null,
        currency: formData.currency,
        country_code: formData.countryCode
      }

      console.log('Sending profile updates:', updates)
      console.log('Personal allowance value:', formData.personalAllowance)
      console.log('Parsed personal allowance:', updates.personal_allowance)

      const updatedProfile = await apiClient.put('/auth/profile', updates)
      console.log('Received updated profile:', updatedProfile)
      
      setProfile(updatedProfile)
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile)
      }
      setSuccess('Profile updated successfully!')
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update profile')
      console.error('Update profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePaydayChange = (value: string) => {
    setFormData({ ...formData, payday: value })
    setShowCustomPayday(value === 'custom')
  }

  // Get currency symbol from currency code
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

  // Get currency-appropriate emoji from currency code
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Income</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Manage your personal information and financial details
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Personal Information</h2>
            <p className="form-section-subtitle">Basic details about yourself</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select
                value={formData.countryCode}
                onChange={(e) => {
                  const selectedCountry = countryCodes.find(c => c.code === e.target.value)
                  setFormData({
                    ...formData, 
                    countryCode: e.target.value,
                    currency: selectedCountry?.currency || 'USD'
                  })
                }}
                className="form-select"
              >
                <option value="">Select country</option>
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Currency</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-2xl">{getCurrencyEmoji(formData.currency)}</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {getCurrencySymbol(formData.currency)} {formData.currency}
              </span>
            </div>
            <p className="form-help-text">
              Automatically set based on your country selection
            </p>
          </div>
        </div>

        {/* Financial Information Section */}
        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Financial Information</h2>
            <p className="form-section-subtitle">Details about your income and financial preferences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">
                Monthly Income ({getCurrencySymbol(formData.currency)})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.income}
                  onChange={(e) => setFormData({...formData, income: e.target.value})}
                  className="form-input pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="form-help-text">
                This helps calculate fair expense splits with your partner
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Payday</label>
              <select
                value={formData.payday}
                onChange={(e) => handlePaydayChange(e.target.value)}
                className="form-select"
              >
                <option value="">Select payday</option>
                {paydayOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="form-help-text">
                We'll remind you to contribute on your payday
              </p>
            </div>
          </div>

          {showCustomPayday && (
            <div className="form-group">
              <label className="form-label">Custom Payday Date</label>
              <input
                type="date"
                value={formData.payday}
                onChange={(e) => setFormData({...formData, payday: e.target.value})}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Monthly Personal Allowance ({getCurrencySymbol(formData.currency)})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {getCurrencySymbol(formData.currency)}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.personalAllowance}
                onChange={(e) => setFormData({...formData, personalAllowance: e.target.value})}
                className="form-input pl-8"
                placeholder="0.00"
              />
            </div>
            <p className="form-help-text">
              Money you keep for personal expenses (optional)
            </p>
          </div>
        </div>

        {/* Income Summary Section */}
        {formData.income && (
          <div className="form-section">
            <div className="form-section-header">
              <h2 className="form-section-title">Income Summary</h2>
              <p className="form-section-subtitle">Overview of your financial breakdown</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getCurrencySymbol(formData.currency)}{parseFloat(formData.income || '0').toFixed(2)}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Monthly Income</div>
              </div>
              
              {formData.personalAllowance && (
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getCurrencySymbol(formData.currency)}{parseFloat(formData.personalAllowance).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Personal Allowance</div>
                </div>
              )}
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className={`text-2xl font-bold ${
                  parseFloat(formData.income || '0') - parseFloat(formData.personalAllowance || '0') >= 0
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {getCurrencySymbol(formData.currency)}
                  {Math.abs(parseFloat(formData.income || '0') - parseFloat(formData.personalAllowance || '0')).toFixed(2)}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  {parseFloat(formData.income || '0') - parseFloat(formData.personalAllowance || '0') >= 0 
                    ? 'Available for Shared Expenses'
                    : 'Shortfall for Shared Expenses'
                  }
                </div>
              </div>
            </div>
            
            {/* Warning/Positive Messages */}
            {parseFloat(formData.income || '0') - parseFloat(formData.personalAllowance || '0') < 0 && (
              <div className="status-error p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium">Personal Allowance Exceeds Income</h5>
                    <p className="text-sm mt-1">
                      Your personal allowance is higher than your income. Consider reducing your personal allowance 
                      or increasing your income to have funds available for shared expenses.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {parseFloat(formData.income || '0') - parseFloat(formData.personalAllowance || '0') >= 0 && (
              <div className="status-success p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium">Healthy Balance</h5>
                    <p className="text-sm mt-1">
                      You have a good balance between personal spending and shared expenses. 
                      This amount can be used for rent, bills, groceries, and other shared costs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-lg font-medium"
          >
            {saving ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
