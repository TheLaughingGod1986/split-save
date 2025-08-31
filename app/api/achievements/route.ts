import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  calculateAchievementProgress, 
  getAchievementSummary, 
  checkNewAchievements,
  ACHIEVEMENTS 
} from '@/lib/achievement-utils'

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data for achievement calculation
    const [contributionsResult, goalsResult, partnershipsResult, progressResult] = await Promise.all([
      supabaseAdmin
        .from('contributions')
        .select('*')
        .eq('user_id', user.id),
      
      supabaseAdmin
        .from('goals')
        .select('*')
        .eq('partnership_id', user.partnershipId || ''),
      
      supabaseAdmin
        .from('partnerships')
        .select('*')
        .eq('id', user.partnershipId || ''),
      
      supabaseAdmin
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ])

    const contributions = contributionsResult.data || []
    const goals = goalsResult.data || []
    const partnerships = partnershipsResult.data || []
    const progress = progressResult.data

    // Calculate safety pot amount from user profile or progress
    let safetyPotAmount = 0
    if (progress) {
      safetyPotAmount = progress.safety_pot_amount || 0
    }

    // Calculate achievement progress
    const achievements = calculateAchievementProgress({
      contributions,
      goals,
      partnerships,
      safetyPotAmount
    })

    // Get previously stored achievements to check for new unlocks
    const { data: storedAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)

    const storedAchievementMap = new Map(
      (storedAchievements || []).map(sa => [sa.achievement_id, sa])
    )

    // Check for new achievements and update database
    const newAchievements = []
    const achievementUpdates = []

    for (const achievement of achievements) {
      const stored = storedAchievementMap.get(achievement.id)
      
      if (achievement.unlocked && !stored?.unlocked) {
        // New achievement unlocked!
        newAchievements.push(achievement)
        achievement.unlockedAt = new Date().toISOString()
        
        achievementUpdates.push({
          user_id: user.id,
          achievement_id: achievement.id,
          unlocked: true,
          unlocked_at: achievement.unlockedAt,
          progress: achievement.progress,
          points_earned: achievement.points
        })
      } else if (stored) {
        // Update progress for existing achievement
        if (stored.progress !== achievement.progress) {
          achievementUpdates.push({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked: achievement.unlocked,
            unlocked_at: stored.unlocked_at,
            progress: achievement.progress,
            points_earned: achievement.unlocked ? achievement.points : 0
          })
        }
        // Preserve unlock date from database
        if (stored.unlocked && stored.unlocked_at) {
          achievement.unlockedAt = stored.unlocked_at
          achievement.unlocked = true
        }
      } else if (achievement.progress > 0) {
        // New achievement with progress
        achievementUpdates.push({
          user_id: user.id,
          achievement_id: achievement.id,
          unlocked: false,
          unlocked_at: null,
          progress: achievement.progress,
          points_earned: 0
        })
      }
    }

    // Batch update achievements
    if (achievementUpdates.length > 0) {
      await supabaseAdmin
        .from('user_achievements')
        .upsert(achievementUpdates, { 
          onConflict: 'user_id,achievement_id',
          ignoreDuplicates: false 
        })
    }

    // Update user progress with new achievement data
    const summary = getAchievementSummary(achievements)
    await supabaseAdmin
      .from('user_progress')
      .upsert({
        user_id: user.id,
        total_points: summary.totalPoints,
        achievements_unlocked: summary.unlockedAchievements,
        current_level: Math.floor(summary.totalPoints / 100) + 1,
        last_updated: new Date().toISOString(),
        // Preserve existing data
        current_streak: progress?.current_streak || 0,
        longest_streak: progress?.longest_streak || 0,
        total_contributions: progress?.total_contributions || contributions.length,
        safety_pot_amount: progress?.safety_pot_amount || 0
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })

    return NextResponse.json({
      achievements,
      summary,
      newAchievements,
      progress: {
        current_streak: progress?.current_streak || 0,
        longest_streak: progress?.longest_streak || 0,
        total_contributions: progress?.total_contributions || contributions.length,
        last_updated: progress?.last_updated || new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { achievementId, forceUnlock } = body

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 })
    }

    // Find the achievement definition
    const achievementDef = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievementDef) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // For admin/testing: force unlock achievement
    if (forceUnlock) {
      await supabaseAdmin
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress: 100,
          points_earned: achievementDef.points
        }, { 
          onConflict: 'user_id,achievement_id',
          ignoreDuplicates: false 
        })

      return NextResponse.json({ 
        message: 'Achievement unlocked successfully',
        achievement: { ...achievementDef, unlocked: true, progress: 100 }
      })
    }

    return NextResponse.json({ error: 'Method not supported' }, { status: 405 })

  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json(
      { error: 'Failed to update achievement' },
      { status: 500 }
    )
  }
}