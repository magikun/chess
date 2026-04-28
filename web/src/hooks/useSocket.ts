'use client'

import { useEffect, useRef, useCallback } from 'react'
import { connectSocket } from '@/lib/socket/client'
import type { Socket } from 'socket.io-client'
import type { RoomState, SocketMove } from '@/types'

interface UseSocketOptions {
  onRoomCreated?: (data: { roomId: string }) => void
  onGameStart?: (room: RoomState) => void
  onMoveMade?: (data: { fen: string; pgn: string; move: string }) => void
  onGameOver?: (data: { result: string; termination: string; room: RoomState; gameId?: string }) => void
  onOpponentDisconnected?: () => void
  onOpponentReconnected?: () => void
  onError?: (msg: string) => void
}

export function useSocket(token: string | undefined, options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null)
  const optionsRef = useRef(options)

  // Keep optionsRef in sync inside an effect so it's never read during render
  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    socketRef.current = socket

    socket.on('roomCreated', (data) => optionsRef.current.onRoomCreated?.(data))
    socket.on('gameStart', (room) => optionsRef.current.onGameStart?.(room))
    socket.on('moveMade', (data) => optionsRef.current.onMoveMade?.(data))
    socket.on('gameOver', (data) => optionsRef.current.onGameOver?.(data))
    socket.on('opponentDisconnected', () => optionsRef.current.onOpponentDisconnected?.())
    socket.on('opponentReconnected', () => optionsRef.current.onOpponentReconnected?.())
    socket.on('error', (msg: string) => optionsRef.current.onError?.(msg))

    return () => {
      socket.off('roomCreated')
      socket.off('gameStart')
      socket.off('moveMade')
      socket.off('gameOver')
      socket.off('opponentDisconnected')
      socket.off('opponentReconnected')
      socket.off('error')
    }
  }, [token])

  const createRoom = useCallback((data: {
    userId: string
    username: string
    color: 'white' | 'black' | 'random'
    coinStake: number
    mode: string
    timeControl?: string
    elo: number
  }) => {
    socketRef.current?.emit('createRoom', data)
  }, [])

  const joinRoom = useCallback((data: { roomId: string; userId: string; username: string; elo: number }) => {
    socketRef.current?.emit('joinRoom', data)
  }, [])

  const sendMove = useCallback((move: SocketMove) => {
    socketRef.current?.emit('move', move)
  }, [])

  const resign = useCallback((roomId: string) => {
    socketRef.current?.emit('resign', { roomId })
  }, [])

  const offerDraw = useCallback((roomId: string) => {
    socketRef.current?.emit('offerDraw', { roomId })
  }, [])

  const acceptDraw = useCallback((roomId: string) => {
    socketRef.current?.emit('acceptDraw', { roomId })
  }, [])

  return { createRoom, joinRoom, sendMove, resign, offerDraw, acceptDraw }
}
