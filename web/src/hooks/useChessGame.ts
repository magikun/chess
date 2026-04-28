'use client'

import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import type { GameResult, Termination, PieceColor } from '@/types'

export interface ChessGameState {
  fen: string
  pgn: string
  turn: PieceColor
  isCheck: boolean
  isGameOver: boolean
  result: GameResult | null
  termination: Termination | null
  history: string[]
  capturedWhite: string[]
  capturedBlack: string[]
  moveCount: number
}

export function useChessGame(startingFen?: string) {
  const chessRef = useRef(new Chess(startingFen))
  const [state, setState] = useState<ChessGameState>(() => buildState(chessRef.current))

  function buildState(chess: Chess): ChessGameState {
    const history = chess.history({ verbose: true })
    const capturedWhite: string[] = []
    const capturedBlack: string[] = []
    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') capturedBlack.push(m.captured)
        else capturedWhite.push(m.captured)
      }
    })

    let result: GameResult | null = null
    let termination: Termination | null = null

    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        result = chess.turn() === 'w' ? 'black' : 'white'
        termination = 'checkmate'
      } else if (chess.isDraw()) {
        result = 'draw'
        termination = chess.isStalemate() ? 'stalemate' : 'agreement'
      }
    }

    return {
      fen: chess.fen(),
      pgn: chess.pgn(),
      turn: chess.turn() === 'w' ? 'white' : 'black',
      isCheck: chess.inCheck(),
      isGameOver: chess.isGameOver(),
      result,
      termination,
      history: chess.history(),
      capturedWhite,
      capturedBlack,
      moveCount: Math.ceil(chess.history().length / 2),
    }
  }

  const makeMove = useCallback((from: string, to: string, promotion = 'q'): boolean => {
    const chess = chessRef.current
    try {
      const move = chess.move({ from, to, promotion })
      if (!move) return false
      setState(buildState(chess))
      return true
    } catch {
      return false
    }
  }, [])

  const loadFen = useCallback((fen: string) => {
    const chess = chessRef.current
    chess.load(fen)
    setState(buildState(chess))
  }, [])

  const loadPgn = useCallback((pgn: string) => {
    const chess = chessRef.current
    chess.loadPgn(pgn)
    setState(buildState(chess))
  }, [])

  const reset = useCallback(() => {
    chessRef.current = new Chess()
    setState(buildState(chessRef.current))
  }, [])

  const resign = useCallback((color: PieceColor) => {
    setState((prev) => ({
      ...prev,
      isGameOver: true,
      result: color === 'white' ? 'black' : 'white',
      termination: 'resignation',
    }))
  }, [])

  const getLegalMoves = useCallback((square: string) => {
    return chessRef.current.moves({ square: square as Parameters<Chess['moves']>[0]['square'], verbose: true })
  }, [])

  return { state, makeMove, loadFen, loadPgn, reset, resign, getLegalMoves, chess: chessRef.current }
}
