// Localization utility for British vs American English

export interface LocalizationConfig {
  isBritish: boolean
}

export function getLocalizedText(config: LocalizationConfig) {
  const { isBritish } = config
  
  return {
    // Goal categories
    vacation: isBritish ? 'Holiday' : 'Vacation',
    
    // Financial terms
    savings: isBritish ? 'Savings' : 'Savings', // Same in both
    expenses: isBritish ? 'Expenses' : 'Expenses', // Same in both
    income: isBritish ? 'Income' : 'Income', // Same in both
    deposit: isBritish ? 'Deposit' : 'Deposit', // Same in both
    
    // UI text
    totalSaved: isBritish ? 'Total Saved' : 'Total Saved',
    safetyPot: isBritish ? 'Safety Pot' : 'Safety Pot',
    currentStreak: isBritish ? 'Current Streak' : 'Current Streak',
    completed: isBritish ? 'Completed' : 'Completed',
    
    // Actions
    addExpense: isBritish ? 'Add Expense' : 'Add Expense',
    recordProgress: isBritish ? 'Record Progress' : 'Record Progress',
    newGoal: isBritish ? 'New Goal' : 'New Goal',
    partnerHub: isBritish ? 'Partner Hub' : 'Partner Hub',
    
    // Descriptions
    recordNewSharedExpense: isBritish ? 'Record a new shared expense' : 'Record a new shared expense',
    updateMonthlyContributions: isBritish ? 'Update your monthly contributions' : 'Update your monthly contributions',
    setNewSavingsTarget: isBritish ? 'Set a new savings target' : 'Set a new savings target',
    viewPartnerActivity: isBritish ? 'View partner activity & approvals' : 'View partner activity & approvals',
    
    // Goal form
    savingsGoals: isBritish ? 'Savings Goals' : 'Savings Goals',
    activeSavingsGoals: isBritish ? 'Active Savings Goals' : 'Active Savings Goals',
    
    // Analytics
    monthlySavings: isBritish ? 'Monthly Savings' : 'Monthly Savings',
    expenseCoverage: isBritish ? 'Expense Coverage' : 'Expense Coverage',
    sharedExpenses: isBritish ? 'Shared Expenses' : 'Shared Expenses',
    
    // Monthly progress
    incomeReality: isBritish ? 'Income Reality' : 'Income Reality',
    extraIncome: isBritish ? 'Extra Income' : 'Extra Income',
    
    // Common phrases
    readyToStart: isBritish ? 'Ready to start your financial journey?' : 'Ready to start your financial journey?',
    keepItUp: isBritish ? 'Keep it up!' : 'Keep it up!',
    totalGoals: isBritish ? 'total goals' : 'total goals',
    monthsCovered: isBritish ? 'months covered' : 'months covered',
    ofTarget: isBritish ? 'of target' : 'of target',
    
    // Time periods
    months: isBritish ? 'months' : 'months',
    goals: isBritish ? 'goals' : 'goals',
  }
}

export function useLocalization(currency?: string) {
  const isBritish = currency === 'GBP'
  return getLocalizedText({ isBritish })
}
