'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/link-button'
import { Brain, Loader2, Trophy, Clock } from 'lucide-react'
import type { Game } from '@/types'

function GameCard({ game, userId }: { game: Game & { white_profile?: { username: string }; black_profile?: { username: string } }; userId: string }) {
  const isWhite = game.white_id === userId
  const myResult = game.result === 'draw' ? 'draw' : (game.result === (isWhite ? 'white' : 'black') ? 'win' : 'loss')
  const opponent = isWhite ? game.black_profile?.username : game.white_profile?.username

  const resultColors = { win: 'text-green-400', loss: 'text-red-400', draw: 'text-yellow-400' }
  const resultLabels = { win: 'Win', loss: 'Loss', draw: 'Draw' }

  const eloChange = isWhite
    ? (game.white_elo_after ?? 0) - (game.white_elo_before ?? 0)
    : (game.black_elo_after ?? 0) - (game.black_elo_before ?? 0)

  return (
    <Card className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`text-lg font-black w-12 text-center ${resultColors[myResult]}`}>
          {resultLabels[myResult]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">vs {opponent ?? 'Unknown'}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{game.mode}</Badge>
            <span>{game.termination}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(game.played_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {eloChange !== 0 && game.mode !== 'ai' && (
          <div className={`text-sm font-bold ${eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {eloChange > 0 ? '+' : ''}{eloChange}
          </div>
        )}
        <LinkButton variant="outline" size="sm" href={`/analysis/${game.id}`} className="shrink-0 text-xs">
          <Brain className="h-3.5 w-3.5 mr-1" /> Analyze
        </LinkButton>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch('/api/games')
      .then((r) => r.json())
      .then(({ games: g }) => { setGames(g ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black">Game History</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-2">No games yet</p>
            <LinkButton href="/play">Play Your First Game</LinkButton>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g as Game & { white_profile?: { username: string }; black_profile?: { username: string } }} userId={user!.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
