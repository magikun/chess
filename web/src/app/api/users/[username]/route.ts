import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, city, elo, is_pro, coins, created_at')
    .eq('username', username)
    .single()

  if (error) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: games } = await supabase
    .from('games')
    .select('id, result, white_id, black_id, mode, played_at, white_elo_before, black_elo_before, white_elo_after, black_elo_after, termination')
    .or(`white_id.eq.${profile.id},black_id.eq.${profile.id}`)
    .order('played_at', { ascending: false })
    .limit(10)

  const total = games?.length ?? 0
  const wins = games?.filter((g) => g.result !== 'draw' && g.result !== null &&
    ((g.white_id === profile.id && g.result === 'white') ||
     (g.black_id === profile.id && g.result === 'black'))
  ).length ?? 0
  const draws = games?.filter((g) => g.result === 'draw').length ?? 0

  return NextResponse.json({ profile, games, stats: { total, wins, losses: total - wins - draws, draws } })
}
