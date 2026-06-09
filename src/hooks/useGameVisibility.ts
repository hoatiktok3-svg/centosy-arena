/**
 * useGameVisibility
 * ─────────────────────────────────────────────────────────────
 * Quản lý trạng thái ẩn/hiện của từng game.
 * - Đọc từ Supabase `app_config` (key = 'game_visibility')
 * - Admin có thể toggle từng game → lưu ngay lên Supabase
 * - Fallback: nếu chưa cấu hình bảng → tất cả ẩn (safe default)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type GameVisibilityMap = Record<string, boolean>

interface UseGameVisibilityReturn {
  visibility:   GameVisibilityMap   // { g01: true, g02: false, ... }
  loading:      boolean
  toggle:       (gameId: string) => Promise<void>
  visibleCount: number
}

const CONFIG_KEY = 'game_visibility'

export function useGameVisibility(isAdmin: boolean): UseGameVisibilityReturn {
  const [visibility, setVisibility] = useState<GameVisibilityMap>({})
  const [loading, setLoading]       = useState(true)

  // ── Fetch visibility config from Supabase ──────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', CONFIG_KEY)
          .single()

        if (!cancelled) {
          if (error || !data) {
            // Table doesn't exist yet or no row — default all hidden
            setVisibility({})
          } else {
            setVisibility((data.value as GameVisibilityMap) ?? {})
          }
        }
      } catch {
        if (!cancelled) setVisibility({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  // ── Admin: toggle a game's visibility ─────────────────────
  const toggle = useCallback(async (gameId: string) => {
    if (!isAdmin) return

    const newValue = { ...visibility, [gameId]: !visibility[gameId] }
    setVisibility(newValue) // optimistic update

    try {
      await supabase.from('app_config').upsert({
        key:        CONFIG_KEY,
        value:      newValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
    } catch {
      // Rollback on failure
      setVisibility(visibility)
    }
  }, [isAdmin, visibility])

  const visibleCount = Object.values(visibility).filter(Boolean).length

  return { visibility, loading, toggle, visibleCount }
}
