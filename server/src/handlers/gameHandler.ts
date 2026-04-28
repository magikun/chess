import type { Server, Socket } from 'socket.io'
import type { RoomManager } from '../rooms/RoomManager'
import { saveGame } from '../services/gameService'
import type { PieceColor } from '../types'

interface MovePayload {
  roomId: string
  from: string
  to: string
  promotion?: string
}

interface ResignPayload {
  roomId: string
}

interface DrawPayload {
  roomId: string
}

// Track draw offers: roomId -> userId who offered
const drawOffers = new Map<string, string>()

export function registerGameHandlers(io: Server, socket: Socket, manager: RoomManager) {
  socket.on('move', async (payload: MovePayload) => {
    const room = manager.get(payload.roomId)
    if (!room || !room.isActive) { socket.emit('error', 'Invalid room or game not active'); return }

    // Verify it's this player's turn
    const player = room.players.find((p) => p.socketId === socket.id)
    if (!player) { socket.emit('error', 'Not in this room'); return }

    const currentTurn: PieceColor = room.chess.turn() === 'w' ? 'white' : 'black'
    if (player.color !== currentTurn) { socket.emit('error', 'Not your turn'); return }

    const success = room.makeMove(payload.from, payload.to, payload.promotion)
    if (!success) { socket.emit('error', 'Illegal move'); return }

    const move = payload.from + payload.to + (payload.promotion ?? '')
    io.to(payload.roomId).emit('moveMade', {
      fen: room.chess.fen(),
      pgn: room.chess.pgn(),
      move,
      turn: room.chess.turn() === 'w' ? 'white' : 'black',
    })

    const { over, result, termination } = room.checkGameOver()
    if (over) {
      const gameId = await saveGame(room)
      io.to(payload.roomId).emit('gameOver', { result, termination, gameId, room: room.getState() })
      setTimeout(() => manager.delete(payload.roomId), 60_000)
    }
  })

  socket.on('resign', async (payload: ResignPayload) => {
    const room = manager.get(payload.roomId)
    if (!room || !room.isActive) return
    const player = room.players.find((p) => p.socketId === socket.id)
    if (!player) return
    room.setResign(player.color)
    const gameId = await saveGame(room)
    io.to(payload.roomId).emit('gameOver', {
      result: room.result,
      termination: 'resignation',
      gameId,
      room: room.getState(),
    })
    setTimeout(() => manager.delete(payload.roomId), 60_000)
  })

  socket.on('offerDraw', (payload: DrawPayload) => {
    const room = manager.get(payload.roomId)
    if (!room || !room.isActive) return
    const player = room.players.find((p) => p.socketId === socket.id)
    if (!player) return
    drawOffers.set(payload.roomId, player.userId)
    socket.to(payload.roomId).emit('drawOffered', { from: player.username })
  })

  socket.on('acceptDraw', async (payload: DrawPayload) => {
    const room = manager.get(payload.roomId)
    if (!room || !room.isActive) return
    const offerer = drawOffers.get(payload.roomId)
    if (!offerer) return
    drawOffers.delete(payload.roomId)
    room.setDraw()
    const gameId = await saveGame(room)
    io.to(payload.roomId).emit('gameOver', {
      result: 'draw',
      termination: 'agreement',
      gameId,
      room: room.getState(),
    })
    setTimeout(() => manager.delete(payload.roomId), 60_000)
  })
}
