'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MoveAnnotation } from '@/types'

interface CoachPanelProps {
  annotations: MoveAnnotation[]
  currentIndex: number
  onSelect: (index: number) => void
}

const CLASS_COLORS: Record<MoveAnnotation['classification'], string> = {
  brilliant: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  good: 'bg-green-500/20 text-green-400 border-green-500/30',
  inaccuracy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  mistake: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  blunder: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const CLASS_ICONS: Record<MoveAnnotation['classification'], string> = {
  brilliant: '!!',
  good: '!',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
}

const CLASS_LABELS: Record<MoveAnnotation['classification'], string> = {
  brilliant: 'Brilliant',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
}

export function CoachPanel({ annotations, currentIndex, onSelect }: CoachPanelProps) {
  const issues = annotations.filter((a) =>
    ['blunder', 'mistake', 'inaccuracy'].includes(a.classification)
  )

  const summary = {
    blunders: annotations.filter((a) => a.classification === 'blunder').length,
    mistakes: annotations.filter((a) => a.classification === 'mistake').length,
    inaccuracies: annotations.filter((a) => a.classification === 'inaccuracy').length,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3">
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{summary.blunders}</div>
          <div className="text-xs text-muted-foreground">Blunders</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-orange-400">{summary.mistakes}</div>
          <div className="text-xs text-muted-foreground">Mistakes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-400">{summary.inaccuracies}</div>
          <div className="text-xs text-muted-foreground">Inaccuracies</div>
        </div>
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto space-y-2 px-3 pb-3">
        {issues.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Great game! No major mistakes found.
          </p>
        ) : (
          issues.map((ann, i) => {
            const moveIdx = annotations.indexOf(ann)
            return (
              <button
                key={i}
                onClick={() => onSelect(moveIdx)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-colors',
                  CLASS_COLORS[ann.classification],
                  currentIndex === moveIdx && 'ring-1 ring-current'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">
                    Move {ann.moveNumber} ({ann.color === 'white' ? '♙' : '♟'})
                  </span>
                  <Badge variant="outline" className={cn('text-xs border-0', CLASS_COLORS[ann.classification])}>
                    {CLASS_ICONS[ann.classification]} {CLASS_LABELS[ann.classification]}
                  </Badge>
                </div>
                <div className="text-xs opacity-80">
                  Best was <code className="font-mono">{ann.best}</code>
                  {' '}({ann.evalBefore > 0 ? '+' : ''}{(ann.evalBefore / 100).toFixed(1)} → {ann.evalAfter > 0 ? '+' : ''}{(ann.evalAfter / 100).toFixed(1)})
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
