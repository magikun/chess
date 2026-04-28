import type { GameResult } from '@/types'

const K = 32

function expected(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

export function computeNewRatings(
  whiteElo: number,
  blackElo: number,
  result: GameResult
): { newWhiteElo: number; newBlackElo: number } {
  const score = result === 'white' ? 1 : result === 'draw' ? 0.5 : 0
  return {
    newWhiteElo: Math.round(whiteElo + K * (score - expected(whiteElo, blackElo))),
    newBlackElo: Math.round(blackElo + K * (1 - score - expected(blackElo, whiteElo))),
  }
}

export function eloToTitle(elo: number): string {
  if (elo >= 2400) return 'Grandmaster'
  if (elo >= 2000) return 'Master'
  if (elo >= 1800) return 'Expert'
  if (elo >= 1600) return 'Advanced'
  if (elo >= 1400) return 'Intermediate'
  if (elo >= 1200) return 'Beginner'
  return 'Novice'
}
