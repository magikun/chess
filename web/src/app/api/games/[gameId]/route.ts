import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      white_profile:profiles!games_white_id_fkey(id, username, elo, avatar_url),
      black_profile:profiles!games_black_id_fkey(id, username, elo, avatar_url)
    `)
    .eq('id', gameId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ game: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { analysis } = body

  const { error } = await supabase.from('games').update({ analysis }).eq('id', gameId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
