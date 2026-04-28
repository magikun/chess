'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { GameOverModal } from './GameOverModal'
import { useChessGame } from '@/hooks/useChessGame'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Flag, Users, Loader2, Coins } from 'lucide-react'
import { toast } from 'sonner'
import type { RoomState, PieceColor, GameResult, Termination } from '@/types'

interface MultiplayerGameProps {
  roomId: string
  coinStake?: number
}

export function MultiplayerGame({ roomId, coinStake = 0 }: MultiplayerGameProps) {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { state, makeMove, loadFen } = useChessGame()
  const [room, setRoom] = useState<RoomState | null>(null)
  const [myColor, setMyColor] = useState<PieceColor | null>(null)
  const [gameOver, setGameOver] = useState<{ result: GameResult; termination: Termination; gameId?: string; coinDelta?: number } | null>(null)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [joining, setJoining] = useState(true)

  const token = user?.id

  const { joinRoom, sendMove, resign } = useSocket(token, {
    onGameStart: (r: RoomState) => {
      setRoom(r)
      setJoining(false)
      const me = r.players.find((p) => p.userId === user?.id)
      if (me) setMyColor(me.color)
      loadFen(r.fen)
      toast.success('Game started!')
    },
    onMoveMade: ({ fen }) => {
      loadFen(fen)
    },
    onGameOver: ({ result, termination, room: finalRoom }) => {
      setRoom(finalRoom)
      setGameOver({
        result: result as GameResult,
        termination: termination as Termination,
        coinDelta: result !== 'draw' && myColor
          ? (result === myColor ? coinStake : -coinStake)
          : 0,
      })
    },
    onOpponentDisconnected: () => {
      setOpponentDisconnected(true)
      toast.warning('Opponent disconnected')
    },
    onOpponentReconnected: () => {
      setOpponentDisconnected(false)
      toast.info('Opponent reconnected')
    },
    onError: (msg) => toast.error(msg),
  })

  useEffect(() => {
    if (!user || !profile) return
    joinRoom({ roomId, userId: user.id, username: profile.username, elo: profile.elo })
  }, [user, profile, roomId, joinRoom])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!room || !myColor || state.turn !== myColor || state.isGameOver) return false
    const success = makeMove(from, to, promotion)
    if (success) {
      sendMove({ roomId, from, to, promotion })
    }
    return success
  }, [room, myColor, state.turn, state.isGameOver, makeMove, sendMove, roomId])

  const handleResign = () => {
    resign(roomId)
    toast.info('You resigned')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Room link copied!')
  }

  if (joining) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-semibold mb-1">Waiting for opponent...</p>
          <p className="text-sm text-muted-foreground mb-4">Share this link to invite someone</p>
          <div className="flex gap-2 justify-center">
            <code className="bg-muted px-3 py-1.5 rounded-lg text-xs font-mono">{roomId}</code>
            <Button size="sm" variant="outline" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const opponent = room?.players.find((p) => p.userId !== user?.id)

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto p-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{opponent?.username ?? 'Opponent'}</span>
            <span className="text-xs text-muted-foreground">({opponent?.elo} ELO)</span>
          </div>
          {opponentDisconnected && <Badge variant="destructive" className="text-xs">Disconnected</Badge>}
        </div>
        <ChessBoard
          fen={state.fen}
          onMove={handleMove}
          orientation={myColor ?? 'white'}
          disabled={state.turn !== myColor || state.isGameOver}
        />
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-sm font-semibold text-primary">{profile?.username}</span>
          <span className="text-xs text-muted-foreground">({profile?.elo} ELO)</span>
          {myColor && <Badge variant="outline" className="text-xs">{myColor === 'white' ? '♙ White' : '♟ Black'}</Badge>}
          {state.isCheck && state.turn === myColor && <Badge variant="destructive" className="text-xs">CHECK!</Badge>}
        </div>
      </div>

      <div className="lg:w-64 flex flex-col gap-3">
        {coinStake > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{coinStake} coins at stake</span>
            </CardContent>
          </Card>
        )}
        <Card className="bg-card/80 border-border/50 flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moves</CardTitle>
          </CardHeader>
          <CardContent className="h-64 overflow-hidden p-0">
            <MoveHistory moves={state.history} />
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="flex-1">
            <Copy className="h-3.5 w-3.5 mr-1" /> Invite
          </Button>
          <Button variant="outline" size="sm" onClick={handleResign} disabled={state.isGameOver} className="flex-1 text-destructive hover:text-destructive border-destructive/30">
            <Flag className="h-3.5 w-3.5 mr-1" /> Resign
          </Button>
        </div>
      </div>

      {gameOver && (
        <GameOverModal
          open={true}
          result={gameOver.result}
          termination={gameOver.termination}
          playerColor={myColor ?? undefined}
          gameId={gameOver.gameId}
          coinDelta={gameOver.coinDelta}
          onNewGame={() => router.push('/play')}
        />
      )}
    </div>
  )
}
