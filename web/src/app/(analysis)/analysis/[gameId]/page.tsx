'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { Chess } from 'chess.js'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { EvalBar } from '@/components/analysis/EvalBar'
import { CoachPanel } from '@/components/analysis/CoachPanel'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Brain, ChevronLeft, ChevronRight, SkipBack, SkipForward, Loader2 } from 'lucide-react'
import { analyzeGame } from '@/lib/stockfish/analysis'
import type { Game, MoveAnnotation } from '@/types'
import { toast } from 'sonner'

export default function AnalysisPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params)
  const [game, setGame] = useState<Game | null>(null)
  const [annotations, setAnnotations] = useState<MoveAnnotation[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [positions, setPositions] = useState<string[]>([])
  const [moves, setMoves] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load game
  useEffect(() => {
    fetch(`/api/games/${gameId}`)
      .then((r) => r.json())
      .then(({ game: g }: { game: Game }) => {
        setGame(g)
        // Build positions array from PGN
        const chess = new Chess()
        const pos: string[] = [chess.fen()]
        const mvs: string[] = []
        chess.loadPgn(g.pgn)
        const history = chess.history({ verbose: true })
        const replay = new Chess()
        history.forEach((m) => {
          replay.move(m.san)
          pos.push(replay.fen())
          mvs.push(m.san)
        })
        setPositions(pos)
        setMoves(mvs)
        if (g.analysis) {
          setAnnotations(g.analysis)
        }
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load game'); setLoading(false) })
  }, [gameId])

  const currentFen = positions[currentIndex + 1] ?? positions[0] ?? 'start'
  const currentAnnotation = currentIndex >= 0 ? annotations[currentIndex] : null

  const arrows = currentAnnotation ? [
    { from: currentAnnotation.best.slice(0, 2), to: currentAnnotation.best.slice(2, 4), color: 'rgba(34,197,94,0.8)' },
    { from: currentAnnotation.played.slice(0, 2), to: currentAnnotation.played.slice(2, 4), color: 'rgba(239,68,68,0.6)' },
  ] : []

  const handleAnalyze = useCallback(async () => {
    if (!game?.pgn) return
    setAnalyzing(true)
    setProgress(0)
    try {
      const results = await analyzeGame(game.pgn, 14, setProgress)
      setAnnotations(results)
      // Save to DB
      await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: results }),
      })
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed — make sure Stockfish WASM is loaded')
    }
    setAnalyzing(false)
  }, [game, gameId])

  const navigate = (dir: number) => {
    setCurrentIndex((prev) => Math.max(-1, Math.min(moves.length - 1, prev + dir)))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!game) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Game not found
    </div>
  )

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black">AI Coach Analysis</h1>
          <Badge variant="secondary">{game.mode}</Badge>
        </div>

        {analyzing && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing positions with Stockfish...</p>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-4">
          {/* Board + eval bar */}
          <div className="flex gap-3 items-start">
            <EvalBar score={currentAnnotation?.evalAfter ?? 0} />
            <div className="flex-1 max-w-[480px]">
              <ChessBoard
                fen={currentFen}
                disabled
                arrows={arrows}
                boardWidth={480}
              />
              {/* Nav controls */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Button variant="outline" size="icon" onClick={() => setCurrentIndex(-1)} className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-20 text-center">
                  {currentIndex + 1} / {moves.length}
                </span>
                <Button variant="outline" size="icon" onClick={() => navigate(1)} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentIndex(moves.length - 1)} className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              {annotations.length === 0 && !analyzing && (
                <Button className="w-full mt-3 glow-gold" onClick={handleAnalyze}>
                  <Brain className="h-4 w-4 mr-2" />
                  Run AI Coach Analysis
                </Button>
              )}
            </div>
          </div>

          {/* Side panels */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Move history */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Moves</CardTitle>
              </CardHeader>
              <CardContent className="h-36 overflow-hidden p-0">
                <MoveHistory
                  moves={moves}
                  currentIndex={currentIndex}
                  onMoveClick={(i) => setCurrentIndex(i)}
                />
              </CardContent>
            </Card>

            {/* Coach panel */}
            {annotations.length > 0 && (
              <Card className="bg-card/80 border-border/50 flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI Coach Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 overflow-hidden p-0">
                  <CoachPanel
                    annotations={annotations}
                    currentIndex={currentIndex}
                    onSelect={setCurrentIndex}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
