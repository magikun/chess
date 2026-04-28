type GameResult = 'white' | 'black' | 'draw'

const K = 32

function expected(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

export function computeNewRatings(whiteElo: number, blackElo: number, result: GameResult) {
  const score = result === 'white' ? 1 : result === 'draw' ? 0.5 : 0
  return {
    newWhiteElo: Math.round(whiteElo + K * (score - expected(whiteElo, blackElo))),
    newBlackElo: Math.round(blackElo + K * (1 - score - expected(blackElo, whiteElo))),
  }
}
