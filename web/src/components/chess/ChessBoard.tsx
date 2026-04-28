'use client'

import { Chessboard } from 'react-chessboard'
import type { Arrow } from 'react-chessboard'

interface ChessBoardArrow {
  from: string
  to: string
  color?: string
}

interface ChessBoardProps {
  fen: string
  onMove?: (from: string, to: string, promotion?: string) => boolean
  orientation?: 'white' | 'black'
  disabled?: boolean
  arrows?: ChessBoardArrow[]
  boardWidth?: number
}

export function ChessBoard({
  fen,
  onMove,
  orientation = 'white',
  disabled = false,
  arrows = [],
  boardWidth,
}: ChessBoardProps) {
  const chessboardArrows: Arrow[] = arrows.map(({ from, to, color }) => ({
    startSquare: from,
    endSquare: to,
    color: color ?? 'rgba(245, 158, 11, 0.8)',
  }))

  return (
    <div style={boardWidth ? { width: boardWidth } : undefined}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          allowDragging: !disabled,
          darkSquareStyle: { backgroundColor: '#b58863' },
          lightSquareStyle: { backgroundColor: '#f0d9b5' },
          arrows: chessboardArrows,
          animationDurationInMs: 150,
          boardStyle: {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          onPieceDrop: disabled || !onMove
            ? undefined
            : ({ sourceSquare, targetSquare }) => {
                if (!targetSquare) return false
                const needsPromotion =
                  (fen.includes(' w ') && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
                  (fen.includes(' b ') && sourceSquare[1] === '2' && targetSquare[1] === '1')
                return onMove(sourceSquare, targetSquare, needsPromotion ? 'q' : undefined)
              },
        }}
      />
    </div>
  )
}
