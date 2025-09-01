import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { data: approvals, error } = await supabaseAdmin
      .from('approval_requests')
      .select(`
        *,
        requested_by_user:users!approval_requests_requested_by_user_id_fkey(id, name)
      `)
      .eq('partnership_id', user.partnershipId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Approvals fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
    }

    // Transform the data to match what the PartnerHub component expects
    const formattedApprovals = approvals.map(approval => {
      const requestData = approval.request_data || {}
      
      return {
        id: approval.id,
        type: approval.request_type,
        title: getApprovalTitle(approval.request_type, requestData),
        amount: getApprovalAmount(approval.request_type, requestData),
        description: getApprovalDescription(approval.request_type, requestData),
        requester_name: approval.requested_by_user?.name || 'Unknown User',
        requester_id: approval.requested_by_user_id,
        created_at: approval.created_at,
        status: approval.status,
        category: requestData.category,
        target_date: requestData.target_date,
        request_data: approval.request_data,
        message: approval.message
      }
    })

    return NextResponse.json(formattedApprovals)
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

// Helper functions to format approval data
function getApprovalTitle(requestType: string, requestData: any): string {
  switch (requestType) {
    case 'expense':
      return requestData.description || 'Expense Request'
    case 'goal':
      return requestData.name || 'Goal Request'
    default:
      return 'Approval Request'
  }
}

function getApprovalAmount(requestType: string, requestData: any): number {
  switch (requestType) {
    case 'expense':
      return requestData.amount || 0
    case 'goal':
      return requestData.target_amount || 0
    default:
      return 0
  }
}

function getApprovalDescription(requestType: string, requestData: any): string {
  switch (requestType) {
    case 'expense':
      return requestData.description || 'No description provided'
    case 'goal':
      return requestData.description || requestData.name || 'No description provided'
    default:
      return 'No description provided'
  }
}
