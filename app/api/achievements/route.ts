import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  calculateAchievementProgress, 
  getAchievementSummary,
  checkNewAchievements,
  calculateContributionStreak 
} from '@/lib/achievement-utils'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's active partnership
    const { data: partnerships } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .limit(1)

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 400 })
    }

    const partnership = partnerships[0]

    // Get all contributions for the partnership
    const { data: contributions } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('partnership_id', partnership.id)

    // Get all goals for the partnership
    const { data: goals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('partnership_id', partnership.id)

    // Get goal contributions for the user
    const { data: goalContributions } = await supabaseAdmin
      .from('goal_contributions')
      .select('*')
      .eq('user_id', user.id)

    // Get safety pot amount
    const { data: safetyPot } = await supabaseAdmin
      .from('safety_pot')
      .select('current_amount')
      .eq('partnership_id', partnership.id)
      .single()

    // Get existing user progress
    const { data: existingProgress } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('partnership_id', partnership.id)
      .single()

    // Get existing user achievements
    const { data: existingAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)

    // Calculate current achievement progress
    const userData = {
      contributions: goalContributions || [],
      goals: goals || [],
      partnerships: partnerships || [],
      safetyPotAmount: safetyPot?.current_amount || 0
    }

    const currentAchievements = calculateAchievementProgress(userData)
    const achievementSummary = getAchievementSummary(currentAchievements)

    // Check for newly unlocked achievements
    const newAchievements = checkNewAchievements(
      existingAchievements || [],
      currentAchievements
    )

    // Update or create user progress record
    const progressData = {
      user_id: user.id,
      partnership_id: partnership.id,
      total_contributions: goalContributions?.length || 0,
      total_contribution_amount: (goalContributions || []).reduce((sum, c) => sum + (c.amount || 0), 0),
      current_streak: achievementSummary.nextAchievement?.requirements.find(r => r.type === 'streak_length')?.current || 0,
      longest_streak: achievementSummary.nextAchievement?.requirements.find(r => r.type === 'streak_length')?.current || 0,
      total_goals: goals?.length || 0,
      completed_goals: goals?.filter(g => g.current_amount >= g.target_amount).length || 0,
      partnership_duration_months: Math.floor((Date.now() - new Date(partnership.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)),
      safety_pot_amount: safetyPot?.current_amount || 0,
      total_points: achievementSummary.totalPoints,
      current_level: Math.floor(achievementSummary.totalPoints / 100) + 1,
      last_updated: new Date().toISOString()
    }

    if (existingProgress) {
      // Update existing progress
      await supabaseAdmin
        .from('user_progress')
        .update(progressData)
        .eq('id', existingProgress.id)
    } else {
      // Create new progress record
      await supabaseAdmin
        .from('user_progress')
        .insert(progressData)
    }

    // Update or create user achievements
    for (const achievement of currentAchievements) {
      const existingAchievement = existingAchievements?.find(a => a.achievement_id === achievement.id)
      
      if (achievement.unlocked && !existingAchievement) {
        // Newly unlocked achievement
        await supabaseAdmin
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
            progress: achievement.progress
          })

        // Log the progress change
        await supabaseAdmin
          .from('achievement_progress_log')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            old_progress: 0,
            new_progress: achievement.progress,
            change_reason: 'Achievement unlocked',
            related_entity_type: achievement.category
          })
      } else if (existingAchievement && achievement.progress !== existingAchievement.progress) {
        // Update progress for existing achievement
        await supabaseAdmin
          .from('user_achievements')
          .update({
            progress: achievement.progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAchievement.id)

        // Log the progress change
        await supabaseAdmin
          .from('achievement_progress_log')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
            old_progress: existingAchievement.progress,
            new_progress: achievement.progress,
            change_reason: 'Progress updated',
            related_entity_type: achievement.category
          })
      }
    }

    return NextResponse.json({
      achievements: currentAchievements,
      summary: achievementSummary,
      newAchievements: newAchievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        points: a.points,
        rarity: a.rarity
      })),
      progress: progressData
    })

  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, achievementId, progress } = body

    if (!action || !achievementId) {
      return NextResponse.json({ error: 'Action and achievement ID are required' }, { status: 400 })
    }

    switch (action) {
      case 'update_progress':
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
          return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
        }

        // Update achievement progress
        const { data: existingAchievement } = await supabaseAdmin
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .eq('achievement_id', achievementId)
          .single()

        if (existingAchievement) {
          const { data: updatedAchievement, error: updateError } = await supabaseAdmin
            .from('user_achievements')
            .update({
              progress: progress,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAchievement.id)
            .select()
            .single()

          if (updateError) {
            throw updateError
          }

          // Log the progress change
          await supabaseAdmin
            .from('achievement_progress_log')
            .insert({
              user_id: user.id,
              achievement_id: achievementId,
              old_progress: existingAchievement.progress,
              new_progress: progress,
              change_reason: 'Manual progress update',
              related_entity_type: 'manual'
            })

          return NextResponse.json({ success: true, achievement: updatedAchievement })
        } else {
          // Create new achievement record
          const { data: newAchievement, error: insertError } = await supabaseAdmin
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievementId,
              progress: progress,
              unlocked_at: progress >= 100 ? new Date().toISOString() : null
            })
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          return NextResponse.json({ success: true, achievement: newAchievement })
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 })
  }
}
