'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MoveHistoryProps {
  moves: string[]
  currentIndex?: number
  onMoveClick?: (index: number) => void
}

export function MoveHistory({ moves, currentIndex, onMoveClick }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moves])

  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]])
  }

  return (
    <div className="h-full overflow-y-auto px-2 py-1 text-sm font-mono">
      {pairs.map(([white, black], i) => (
        <div key={i} className="flex gap-1 py-0.5 hover:bg-muted/30 rounded px-1">
          <span className="text-muted-foreground w-6 shrink-0">{i + 1}.</span>
          <button
            onClick={() => onMoveClick?.(i * 2)}
            className={cn(
              'flex-1 text-left px-1 rounded hover:text-primary transition-colors',
              currentIndex === i * 2 && 'text-primary bg-primary/10'
            )}
          >
            {white}
          </button>
          {black && (
            <button
              onClick={() => onMoveClick?.(i * 2 + 1)}
              className={cn(
                'flex-1 text-left px-1 rounded hover:text-primary transition-colors',
                currentIndex === i * 2 + 1 && 'text-primary bg-primary/10'
              )}
            >
              {black}
            </button>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
