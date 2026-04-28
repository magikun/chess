import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, city, elo, is_pro, created_at')
    .order('elo', { ascending: false })
    .range(offset, offset + limit - 1)

  if (city) query = query.ilike('city', city)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}
