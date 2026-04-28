'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Search, Loader2, Crown } from 'lucide-react'
import { eloToTitle } from '@/lib/elo'
import type { UserProfile } from '@/types'

async function loadUsers(cityFilter = ''): Promise<UserProfile[]> {
  const url = cityFilter ? `/api/users?city=${encodeURIComponent(cityFilter)}` : '/api/users'
  const r = await fetch(url)
  const { users } = await r.json()
  return users ?? []
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    loadUsers().then((u) => {
      if (!cancelled) {
        setUsers(u)
        setLoading(false)
      }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const fetchUsers = (cityFilter = '') => {
    setLoading(true)
    loadUsers(cityFilter)
      .then((u) => { setUsers(u); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const filtered = users.filter((u) =>
    !search || u.username.toLowerCase().includes(search.toLowerCase())
  )

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black">Global Leaderboard</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-input/50"
            />
          </div>
          <Input
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers(city)}
            className="w-40 bg-input/50"
          />
          <Button variant="outline" onClick={() => fetchUsers(city)}>Go</Button>
          {city && (
            <Button variant="ghost" onClick={() => { setCity(''); fetchUsers('') }}>Clear</Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user, i) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/40 transition-colors group"
              >
                <div className="w-8 text-center font-bold text-muted-foreground">
                  {i < 3 ? medals[i] : <span className="text-sm">#{i + 1}</span>}
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 truncate">
                    {user.username}
                    {user.is_pro && <Crown className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{eloToTitle(user.elo)}</span>
                    {user.city && <><Medal className="h-3 w-3" />{user.city}</>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-lg text-primary">{user.elo}</div>
                  <div className="text-xs text-muted-foreground">ELO</div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                  {eloToTitle(user.elo)}
                </Badge>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No players found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
