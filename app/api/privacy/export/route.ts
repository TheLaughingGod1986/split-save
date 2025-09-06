import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== DATA EXPORT API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    if (!['json', 'csv', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported formats: json, csv, pdf' }, { status: 400 })
    }

    // Fetch all user data
    const [profileResult, partnershipsResult, goalsResult, expensesResult, invitationsResult] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      
      supabaseAdmin
        .from('partnerships')
        .select(`
          *,
          user1:users!partnerships_user1_id_fkey(id, name, email),
          user2:users!partnerships_user2_id_fkey(id, name, email)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
      
      supabaseAdmin
        .from('goals')
        .select('*')
        .eq('added_by_user_id', user.id),
      
      supabaseAdmin
        .from('expenses')
        .select('*')
        .eq('added_by_user_id', user.id),
      
      supabaseAdmin
        .from('partnership_invitations')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    ])

    // Check for errors
    if (profileResult.error) {
      console.error('Profile fetch error:', profileResult.error)
      return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 })
    }

    // Compile user data
    const userData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      profile: profileResult.data,
      partnerships: partnershipsResult.data || [],
      goals: goalsResult.data || [],
      expenses: expensesResult.data || [],
      invitations: invitationsResult.data || []
    }

    // Generate response based on format
    if (format === 'json') {
      return new NextResponse(JSON.stringify(userData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="splitsave-data-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(userData)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="splitsave-data-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return a simple text representation
      // In a real implementation, you'd use a PDF library like puppeteer or jsPDF
      const textData = convertToText(userData)
      return new NextResponse(textData, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="splitsave-data-${new Date().toISOString().split('T')[0]}.txt"`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Data export method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== DATA EXPORT API ROUTE END ===')
  }
}

function convertToCSV(data: any): string {
  const csvRows = []
  
  // Add header
  csvRows.push('Data Type,Field,Value')
  
  // Add profile data
  if (data.profile) {
    Object.entries(data.profile).forEach(([key, value]) => {
      csvRows.push(`Profile,${key},"${value}"`)
    })
  }
  
  // Add goals data
  data.goals.forEach((goal: any, index: number) => {
    Object.entries(goal).forEach(([key, value]) => {
      csvRows.push(`Goal ${index + 1},${key},"${value}"`)
    })
  })
  
  // Add expenses data
  data.expenses.forEach((expense: any, index: number) => {
    Object.entries(expense).forEach(([key, value]) => {
      csvRows.push(`Expense ${index + 1},${key},"${value}"`)
    })
  })
  
  return csvRows.join('\n')
}

function convertToText(data: any): string {
  let text = `SplitSave Data Export\n`
  text += `Export Date: ${data.exportDate}\n`
  text += `User ID: ${data.userId}\n`
  text += `User Email: ${data.userEmail}\n\n`
  
  text += `=== PROFILE DATA ===\n`
  if (data.profile) {
    Object.entries(data.profile).forEach(([key, value]) => {
      text += `${key}: ${value}\n`
    })
  }
  
  text += `\n=== GOALS (${data.goals.length}) ===\n`
  data.goals.forEach((goal: any, index: number) => {
    text += `Goal ${index + 1}: ${goal.name}\n`
    text += `  Target: ${goal.target_amount}\n`
    text += `  Current: ${goal.current_amount}\n`
    text += `  Target Date: ${goal.target_date}\n\n`
  })
  
  text += `\n=== EXPENSES (${data.expenses.length}) ===\n`
  data.expenses.forEach((expense: any, index: number) => {
    text += `Expense ${index + 1}: ${expense.description}\n`
    text += `  Amount: ${expense.amount}\n`
    text += `  Date: ${expense.date}\n`
    text += `  Category: ${expense.category}\n\n`
  })
  
  return text
}
