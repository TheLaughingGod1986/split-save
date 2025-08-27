# Product Requirements Document (PRD)
**Product Name:** SplitSave  
**Version:** MVP v1.1  
**Author:** Benjamin Oats  
**Date:** 16 August 2025  
**Status:** Enhanced MVP Implementation  

## 1. Executive Summary
SplitSave is a mobile app for couples to fairly calculate and manage shared financial responsibilities. The app empowers users to contribute based on income proportion, track savings goals, and stay financially aligned. With smart reminders, gamification, and adaptive ML recommendations, SplitSave supports transparent and stress-free money management.

## 2. Goals & Objectives
**Primary Goals**
• Enable proportional contributions toward shared expenses and savings
• Foster financial transparency and communication between partners
• Gamify healthy financial habits and goal tracking

**Success Criteria**
• Users complete setup and calculate contributions in under 5 minutes
• Monthly reminders are acted on by 80% of users
• 75% retention for 3+ months of continued use

## 3. Target Users
• Couples (cohabiting or long-distance) aged 25–40
• Users managing joint expenses or savings goals (e.g., rent, holidays, house deposit)
• Financially mindful individuals seeking budgeting help with or without a partner

## 4. Features & Requirements

### Income & Expense Input
• Individual income, expenses, and personal allowance input
• **✨ NEW: Editable profile with income/payday modification post-onboarding**
• Shared household expenses and joint savings goals
• Supports one-time and recurring goal types
• **✨ NEW: Complete expense management (edit/delete functionality)**

### Proportional Calculator
• Proportional split based on income
• Toggle between 50/50 and proportional
• Dynamic projections and historical view

### Partner System
• Each user logs in independently
• Shared goals and expenses require mutual approval
• Activity notifications (e.g., contribution, update, missed input)

### Payday Tracking & Notifications
• Each partner sets payday
• **✨ ENHANCED: Advanced payday options including "last Friday of month", "last working day"**
• Push reminders to contribute on payday
• Track and notify missed or surplus savings

### Savings Goals Management
• **✨ NEW: Complete Add Goal functionality with categories**
• Goal categories: vacation, emergency fund, house deposit, wedding, etc.
• Target amounts and dates
• Progress tracking and contributions

### Currency Support
• **✨ NEW: Multi-currency support (£, $, €, etc.)**
• User-selectable currency with consistent display
• Proper currency symbol handling throughout app

### Form Validation
• **✨ NEW: Email validation with proper regex**
• Input sanitization and error handling
• User-friendly validation feedback

### Gamification
• Streaks for monthly contributions
• Badges for savings milestones (e.g. '3-Month Saver')
• Animated celebrations on goal achievements

### Safety Pot
• Dedicated emergency buffer for joint expenses
• Shows how many months of expenses are covered
• ML suggests reallocating excess funds to savings
• Widget displays safety net amount and notifications to rebalance or refill

### Machine Learning
• Learns from under-saving behavior (users explain why)
• Adapts recommendations to be more realistic
• Suggests re-weighting goals and safety pot optimization
• Recommends contribution levels based on user patterns

### Widgets & Dashboard
• iOS widgets showing goal progress, safety pot, and streaks
• Partner activity feed with real-time updates
• Dynamic charts for savings, expenses, and forecasts

## 5. User Stories
• As a couple, we want to fairly split expenses based on income
• As a user, I want to be reminded on payday to contribute
• As a partner, I want to see when my partner saves more or less than expected
• As a user, I want an emergency buffer so I don't feel pressure when things go wrong
• **✨ NEW: As a user, I want to edit my income/profile after initial setup**
• **✨ NEW: As a user, I want to create and track multiple savings goals**
• **✨ NEW: As a user, I want to choose my preferred currency**

## 6. Technical & Architecture Summary
• React Native + TypeScript (Expo)
• Local-first with optional Supabase sync
• Biometric auth (optional), PDF/CSV export (MVP+)
• Charts: Victory Native or react-native-svg

## 7. MVP v1.1 Implementation Notes
**Priority Fixes:**
1. Complete savings goals functionality
2. Profile editing capabilities
3. Currency selection and consistent display
4. Advanced payday options
5. Form validation improvements
6. Expense management (edit/delete)

**Success Metrics for v1.1:**
• 100% feature completion rate for core flows
• Zero critical UX gaps in user journey
• Consistent currency display across all screens
• Valid email capture rate of 95%+

## 8. Future Opportunities
• AI assistant for financial coaching
• Shared virtual card integration (Monzo Pots, Curve)
• Subscription tiers for advanced analytics and exports