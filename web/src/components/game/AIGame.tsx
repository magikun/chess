'use client'

import { useEffect, useCallback, useState } from 'react'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { GameOverModal } from './GameOverModal'
import { useChessGame } from '@/hooks/useChessGame'
import { useStockfish } from '@/hooks/useStockfish'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Bot, User, Flag, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const SKILL_LABELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Master']
const SKILL_LEVELS = [1, 5, 10, 15, 20]
const MOVE_TIMES = [300, 500, 800, 1200, 2000]

interface AIGameProps {
  playerColor?: 'white' | 'black'
  initialSkill?: number
}

export function AIGame({ playerColor = 'white', initialSkill = 2 }: AIGameProps) {
  const { state, makeMove, reset, resign } = useChessGame()
  const { ready, thinking, getBestMove } = useStockfish()
  const { profile } = useAuth()
  const [skill, setSkill] = useState(initialSkill)
  const [savedGameId, setSavedGameId] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const isAITurn = !state.isGameOver && (
    (playerColor === 'white' && state.turn === 'black') ||
    (playerColor === 'black' && state.turn === 'white')
  )

  const doAIMove = useCallback(async () => {
    if (!ready || thinking) return
    const move = await getBestMove(state.fen, SKILL_LEVELS[skill], MOVE_TIMES[skill])
    if (move && move !== '(none)') {
      const from = move.slice(0, 2)
      const to = move.slice(2, 4)
      const promotion = move.length > 4 ? move[4] : undefined
      makeMove(from, to, promotion)
    }
  }, [ready, thinking, state.fen, skill, getBestMove, makeMove])

  useEffect(() => {
    if (isAITurn && gameStarted) {
      const timer = setTimeout(doAIMove, 300)
      return () => clearTimeout(timer)
    }
  }, [isAITurn, doAIMove, gameStarted])

  const handleMove = (from: string, to: string, promotion?: string): boolean => {
    if (state.turn !== playerColor || state.isGameOver) return false
    const success = makeMove(from, to, promotion)
    if (success && !gameStarted) setGameStarted(true)
    return success
  }

  const handleResign = () => {
    resign(playerColor)
    toast.info('You resigned')
  }

  const handleNewGame = () => {
    reset()
    setSavedGameId(null)
    setGameStarted(false)
  }

  // Save game when over
  useEffect(() => {
    if (!state.isGameOver || savedGameId || !gameStarted || !profile) return
    const saveGame = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('games').insert({
        white_id: playerColor === 'white' ? profile.id : null,
        black_id: playerColor === 'black' ? profile.id : null,
        result: state.result,
        termination: state.termination,
        pgn: state.pgn,
        mode: 'ai',
        coin_stake: 0,
      }).select('id').single()
      if (data) setSavedGameId(data.id)
    }
    saveGame()
  }, [state.isGameOver, savedGameId, gameStarted, profile, state, playerColor])

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Bot className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            Stockfish — {SKILL_LABELS[skill]}
            {thinking && <span className="ml-2 text-primary animate-pulse">thinking...</span>}
          </span>
        </div>
        <ChessBoard
          fen={state.fen}
          onMove={handleMove}
          orientation={playerColor}
          disabled={isAITurn || state.isGameOver}
        />
        <div className="flex items-center gap-2 mt-2 px-1">
          <User className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {profile?.username ?? 'You'} ({playerColor === 'white' ? '♙ White' : '♟ Black'})
          </span>
          {state.isCheck && state.turn === playerColor && (
            <Badge variant="destructive" className="text-xs">CHECK!</Badge>
          )}
        </div>
      </div>

      <div className="lg:w-64 flex flex-col gap-3">
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Difficulty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center font-bold text-primary">{SKILL_LABELS[skill]}</div>
            <Slider
              min={0}
              max={4}
              step={1}
              value={skill}
              onValueChange={(v) => { setSkill(typeof v === 'number' ? v : (v as number[])[0]); handleNewGame() }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Master</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50 flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moves</CardTitle>
          </CardHeader>
          <CardContent className="h-48 overflow-hidden p-0">
            <MoveHistory moves={state.history} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResign} disabled={state.isGameOver || !gameStarted} className="flex-1">
            <Flag className="h-4 w-4 mr-1" /> Resign
          </Button>
          <Button variant="outline" size="sm" onClick={handleNewGame} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-1" /> New
          </Button>
        </div>

        {!ready && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">Loading AI engine...</p>
        )}
      </div>

      <GameOverModal
        open={state.isGameOver}
        result={state.result!}
        termination={state.termination!}
        playerColor={playerColor}
        gameId={savedGameId ?? undefined}
        onNewGame={handleNewGame}
      />
    </div>
  )
}
