'use client'

interface EvalBarProps {
  score: number // centipawns, positive = white advantage
  orientation?: 'white' | 'black'
}

export function EvalBar({ score, orientation = 'white' }: EvalBarProps) {
  // Clamp to ±500cp range and convert to 0-100 percentage
  const clamped = Math.max(-500, Math.min(500, score))
  const whitePct = ((clamped + 500) / 1000) * 100
  const displayPct = orientation === 'white' ? whitePct : 100 - whitePct

  const label = Math.abs(score) > 900
    ? (score > 0 ? 'M' : '-M')
    : (score > 0 ? `+${(score / 100).toFixed(1)}` : (score / 100).toFixed(1))

  return (
    <div className="flex flex-col items-center w-6 select-none" title={label}>
      <div className="text-[9px] font-mono text-muted-foreground mb-1 leading-none">
        {score > 0 ? '+' : ''}{(score / 100).toFixed(1)}
      </div>
      <div className="flex-1 w-4 rounded-full overflow-hidden bg-gray-800 flex flex-col-reverse min-h-[200px]">
        <div
          className="w-full bg-white transition-all duration-300"
          style={{ height: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
