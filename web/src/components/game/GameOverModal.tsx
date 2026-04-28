'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Brain, RotateCcw, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GameResult, Termination } from '@/types'

interface GameOverModalProps {
  open: boolean
  result: GameResult
  termination: Termination
  playerColor?: 'white' | 'black'
  gameId?: string
  coinDelta?: number
  onRematch?: () => void
  onNewGame?: () => void
}

const RESULT_MESSAGES: Record<string, { title: string; emoji: string }> = {
  win: { title: 'You Won!', emoji: '🏆' },
  loss: { title: 'You Lost', emoji: '😔' },
  draw: { title: 'Draw', emoji: '🤝' },
}

const TERMINATION_LABELS: Record<string, string> = {
  checkmate: 'by Checkmate',
  resignation: 'by Resignation',
  stalemate: 'by Stalemate',
  timeout: 'on Time',
  agreement: 'by Agreement',
}

export function GameOverModal({
  open,
  result,
  termination,
  playerColor,
  gameId,
  coinDelta,
  onRematch,
  onNewGame,
}: GameOverModalProps) {
  const router = useRouter()

  let outcome: 'win' | 'loss' | 'draw' = 'draw'
  if (result === 'draw') outcome = 'draw'
  else if (playerColor && result === playerColor) outcome = 'win'
  else if (playerColor) outcome = 'loss'

  const { title, emoji } = RESULT_MESSAGES[outcome]

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm text-center border-border/50 bg-card/95 backdrop-blur">
        <DialogTitle className="sr-only">Game Over</DialogTitle>
        <div className="py-4">
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-black mb-1">{title}</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {TERMINATION_LABELS[termination] ?? termination}
          </p>
          {coinDelta !== undefined && coinDelta !== 0 && (
            <div className={`flex items-center justify-center gap-2 mb-4 text-sm font-semibold ${
              coinDelta > 0 ? 'text-primary' : 'text-destructive'
            }`}>
              <Coins className="h-4 w-4" />
              {coinDelta > 0 ? `+${coinDelta}` : coinDelta} coins
            </div>
          )}
          <div className="flex flex-col gap-2">
            {gameId && (
              <Button
                variant="outline"
                className="w-full border-primary/30 text-primary"
                onClick={() => router.push(`/analysis/${gameId}`)}
              >
                <Brain className="h-4 w-4 mr-2" />
                Analyze with AI Coach
              </Button>
            )}
            {onRematch && (
              <Button variant="outline" className="w-full" onClick={onRematch}>
                <RotateCcw className="h-4 w-4 mr-2" /> Rematch
              </Button>
            )}
            <Button className="w-full" onClick={onNewGame ?? (() => router.push('/play'))}>
              <Trophy className="h-4 w-4 mr-2" /> New Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
