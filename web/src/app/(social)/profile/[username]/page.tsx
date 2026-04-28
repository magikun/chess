'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Crown, Trophy, UserPlus, UserCheck, Loader2, Brain, Globe } from 'lucide-react'
import { eloToTitle } from '@/lib/elo'
import { toast } from 'sonner'
import type { UserProfile } from '@/types'

interface ProfileData {
  profile: UserProfile
  stats: { total: number; wins: number; losses: number; draws: number }
  games: Array<{
    id: string
    result: string
    white_id: string
    black_id: string
    mode: string
    played_at: string
    termination: string
    white_elo_after: number | null
    black_elo_after: number | null
  }>
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { user } = useAuth()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [username])

  const handleFollow = async () => {
    if (!data) return
    setFollowLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch('/api/follow', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followingId: data.profile.id }),
    })
    if (res.ok) {
      setFollowing(!following)
      toast.success(following ? 'Unfollowed' : 'Following!')
    } else {
      toast.error('Failed')
    }
    setFollowLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Player not found
    </div>
  )

  const { profile, stats, games } = data
  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0
  const isMe = user?.id === profile.id

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-2xl shrink-0">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{profile.username}</h1>
              {profile.is_pro && (
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" /> PRO
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground">{profile.elo} ELO</span>
              <span>·</span>
              <span>{eloToTitle(profile.elo)}</span>
              {profile.city && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {profile.city}
                  </span>
                </>
              )}
            </div>
          </div>
          {!isMe && user && (
            <Button
              variant={following ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleFollow}
              disabled={followLoading}
              className="shrink-0"
            >
              {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                following ? <><UserCheck className="h-4 w-4 mr-1" /> Following</> :
                <><UserPlus className="h-4 w-4 mr-1" /> Follow</>
              }
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Games', value: stats.total },
            { label: 'Wins', value: stats.wins, cls: 'text-green-400' },
            { label: 'Losses', value: stats.losses, cls: 'text-red-400' },
            { label: 'Win Rate', value: `${winRate}%`, cls: 'text-primary' },
          ].map(({ label, value, cls }) => (
            <Card key={label} className="bg-card/60 border-border/50">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-black ${cls ?? ''}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent games */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No games yet</p>
            ) : (
              games.map((g) => {
                const isWhite = g.white_id === profile.id
                const myResult = g.result === 'draw' ? 'draw'
                  : g.result === (isWhite ? 'white' : 'black') ? 'win' : 'loss'
                const resultColors = { win: 'text-green-400', loss: 'text-red-400', draw: 'text-yellow-400' }
                return (
                  <div key={g.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <span className={`text-sm font-bold w-8 ${resultColors[myResult]}`}>
                      {myResult === 'win' ? 'W' : myResult === 'loss' ? 'L' : 'D'}
                    </span>
                    <div className="flex-1 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs mr-2">{g.mode}</Badge>
                      {g.termination}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(g.played_at).toLocaleDateString()}
                    </span>
                    <LinkButton variant="ghost" size="sm" href={`/analysis/${g.id}`} className="h-7 text-xs">
                      <Brain className="h-3 w-3 mr-1" /> Review
                    </LinkButton>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
