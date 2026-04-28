import type { Server, Socket } from 'socket.io'
import type { RoomManager } from '../rooms/RoomManager'
import type { PieceColor, GameMode } from '../types'

interface CreateRoomPayload {
  userId: string
  username: string
  color: 'white' | 'black' | 'random'
  coinStake: number
  mode: GameMode
  timeControl?: string
  elo: number
}

interface JoinRoomPayload {
  roomId: string
  userId: string
  username: string
  elo: number
}

export function registerRoomHandlers(io: Server, socket: Socket, manager: RoomManager) {
  socket.on('createRoom', (payload: CreateRoomPayload) => {
    try {
      const room = manager.create(payload.coinStake, payload.mode, payload.timeControl ?? null)
      const color: PieceColor = payload.color === 'random'
        ? (Math.random() < 0.5 ? 'white' : 'black')
        : payload.color

      const added = room.addPlayer({
        userId: payload.userId,
        username: payload.username,
        color,
        elo: payload.elo,
        socketId: socket.id,
        connected: true,
      })

      if (!added) { socket.emit('error', 'Could not create room'); return }
      socket.join(room.roomId)
      socket.emit('roomCreated', { roomId: room.roomId })
    } catch (e) {
      socket.emit('error', 'Server error creating room')
    }
  })

  socket.on('joinRoom', (payload: JoinRoomPayload) => {
    const room = manager.get(payload.roomId)
    if (!room) { socket.emit('error', 'Room not found'); return }
    if (room.status === 'finished') { socket.emit('error', 'Game already finished'); return }

    // Reconnect?
    const existing = room.players.find((p) => p.userId === payload.userId)
    if (existing) {
      room.reconnectPlayer(payload.userId, socket.id)
      socket.join(room.roomId)
      socket.emit('gameStart', room.getState())
      io.to(room.roomId).emit('opponentReconnected')
      return
    }

    if (room.isFull) { socket.emit('error', 'Room is full'); return }

    const takenColor = room.players[0]?.color
    const color: PieceColor = takenColor === 'white' ? 'black' : 'white'

    const added = room.addPlayer({
      userId: payload.userId,
      username: payload.username,
      color,
      elo: payload.elo,
      socketId: socket.id,
      connected: true,
    })

    if (!added) { socket.emit('error', 'Could not join room'); return }
    socket.join(room.roomId)
    io.to(room.roomId).emit('gameStart', room.getState())
  })

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      const room = manager.get(roomId)
      if (room) {
        room.removePlayer(socket.id)
        socket.to(roomId).emit('opponentDisconnected')
      }
    }
  })
}
