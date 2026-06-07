/**
 * useGameRecognition — STEP 69
 * Hook kiểm tra sau khi game xong:
 *   - isNewRecord: điểm cao hơn best score cũ?
 *   - isTopThree + rank: user có trong top 3 leaderboard không?
 */
import { useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

export interface RecognitionResult {
  isNewRecord:  boolean
  isTopThree:   boolean
  rank:         number | null
}

export function useGameRecognition() {
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [checking, setChecking] = useState(false)

  const checkRecognition = useCallback(async (
    userId:  string,
    gameKey: string,
    score:   number
  ) => {
    setChecking(true)

    // 1. Check personal best (trước lần này)
    const { data: prevBest } = await supabase
      .from('game_sessions')
      .select('score')
      .eq('user_id', userId)
      .eq('game_key', gameKey)
      .eq('status', 'completed')
      .order('score', { ascending: false })
      .limit(2)  // lấy 2 để so sánh (lần mới nhất là lần vừa save)

    // Lấy best của các lần trước (bỏ qua lần vừa save)
    const prevScores = (prevBest ?? []).map(r => r.score)
    const prevPersonalBest = prevScores.length > 1 ? Math.max(...prevScores.slice(1)) : 0
    const isNewRecord = score > prevPersonalBest && prevPersonalBest > 0

    // 2. Check leaderboard rank (aggregate by user, lấy top 3)
    const { data: topSessions } = await supabase
      .from('game_sessions')
      .select('user_id, score')
      .eq('game_key', gameKey)
      .eq('status', 'completed')
      .eq('score_credited', true)
      .order('score', { ascending: false })
      .limit(100)

    // Aggregate: best score per user
    const userBest: Record<string, number> = {}
    for (const s of topSessions ?? []) {
      if (!userBest[s.user_id] || s.score > userBest[s.user_id]) {
        userBest[s.user_id] = s.score
      }
    }
    const ranked = Object.entries(userBest)
      .sort((a, b) => b[1] - a[1])
      .map(([uid]) => uid)

    const rankIdx = ranked.indexOf(userId)
    const rank = rankIdx >= 0 ? rankIdx + 1 : null
    const isTopThree = rank !== null && rank <= 3

    setResult({ isNewRecord, isTopThree, rank })
    setChecking(false)
    return { isNewRecord, isTopThree, rank }
  }, [])

  const clear = useCallback(() => setResult(null), [])

  return { checkRecognition, result, checking, clear }
}
