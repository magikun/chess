import { Chess } from 'chess.js'
import { StockfishWorker } from './StockfishWorker'
import type { MoveAnnotation, PieceColor } from '@/types'

function classify(delta: number): MoveAnnotation['classification'] {
  const abs = Math.abs(delta)
  if (abs > 300) return 'blunder'
  if (abs > 150) return 'mistake'
  if (abs > 75) return 'inaccuracy'
  if (delta < -30) return 'brilliant'
  return 'good'
}

export async function analyzeGame(
  pgn: string,
  depth = 16,
  onProgress?: (pct: number) => void
): Promise<MoveAnnotation[]> {
  const engine = new StockfishWorker()
  await engine.init()

  const chess = new Chess()
  chess.loadPgn(pgn)
  const history = chess.history({ verbose: true })

  const annotations: MoveAnnotation[] = []
  const replay = new Chess()

  for (let i = 0; i < history.length; i++) {
    const move = history[i]
    const fenBefore = replay.fen()

    const { score: evalBefore } = await engine.getEval(fenBefore, depth)

    replay.move(move.san)
    const fenAfter = replay.fen()

    const { score: evalAfterRaw, bestMove } = await engine.getEval(fenAfter, depth)
    const evalAfter = -evalAfterRaw

    const color: PieceColor = move.color === 'w' ? 'white' : 'black'
    const delta = color === 'white' ? evalAfter - evalBefore : evalBefore - evalAfter

    annotations.push({
      fen: fenBefore,
      played: move.from + move.to + (move.promotion ?? ''),
      best: bestMove,
      evalBefore,
      evalAfter,
      delta,
      classification: classify(delta),
      moveNumber: Math.floor(i / 2) + 1,
      color,
    })

    onProgress?.(Math.round(((i + 1) / history.length) * 100))
  }

  engine.terminate()
  return annotations
}
