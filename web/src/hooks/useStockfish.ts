'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { StockfishWorker } from '@/lib/stockfish/StockfishWorker'

export function useStockfish() {
  const engineRef = useRef<StockfishWorker | null>(null)
  const [ready, setReady] = useState(false)
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    const engine = new StockfishWorker()
    engineRef.current = engine
    engine.init().then(() => setReady(true)).catch(console.error)
    return () => engine.terminate()
  }, [])

  const getBestMove = useCallback(async (fen: string, skillLevel = 10, moveTimeMs = 1000): Promise<string | null> => {
    if (!engineRef.current?.isReady()) return null
    setThinking(true)
    try {
      return await engineRef.current.getBestMove(fen, skillLevel, moveTimeMs)
    } finally {
      setThinking(false)
    }
  }, [])

  return { ready, thinking, getBestMove }
}
