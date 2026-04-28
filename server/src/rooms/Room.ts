import { Chess } from 'chess.js'
import type { RoomPlayer, RoomState, GameResult, Termination, PieceColor } from '../types'

export class Room {
  roomId: string
  players: RoomPlayer[] = []
  chess: Chess
  status: RoomState['status'] = 'waiting'
  coinStake: number
  mode: RoomState['mode']
  timeControl: string | null
  result?: GameResult
  termination?: Termination
  createdAt: number

  constructor(roomId: string, coinStake = 0, mode: RoomState['mode'] = 'rated', timeControl: string | null = null) {
    this.roomId = roomId
    this.chess = new Chess()
    this.coinStake = coinStake
    this.mode = mode
    this.timeControl = timeControl
    this.createdAt = Date.now()
  }

  addPlayer(player: RoomPlayer): boolean {
    if (this.players.length >= 2) return false
    if (this.players.find((p) => p.userId === player.userId)) return false
    this.players.push(player)
    if (this.players.length === 2) this.status = 'playing'
    return true
  }

  removePlayer(socketId: string) {
    const player = this.players.find((p) => p.socketId === socketId)
    if (player) player.connected = false
  }

  reconnectPlayer(userId: string, socketId: string): boolean {
    const player = this.players.find((p) => p.userId === userId)
    if (player) {
      player.socketId = socketId
      player.connected = true
      return true
    }
    return false
  }

  makeMove(from: string, to: string, promotion?: string): boolean {
    try {
      const move = this.chess.move({ from, to, promotion: promotion ?? 'q' })
      return !!move
    } catch {
      return false
    }
  }

  getState(): RoomState {
    return {
      roomId: this.roomId,
      players: this.players,
      fen: this.chess.fen(),
      pgn: this.chess.pgn(),
      status: this.status,
      coinStake: this.coinStake,
      mode: this.mode,
      timeControl: this.timeControl,
      result: this.result,
      termination: this.termination,
      createdAt: this.createdAt,
    }
  }

  checkGameOver(): { over: boolean; result?: GameResult; termination?: Termination } {
    if (!this.chess.isGameOver()) return { over: false }
    let result: GameResult = 'draw'
    let termination: Termination = 'agreement'
    if (this.chess.isCheckmate()) {
      result = this.chess.turn() === 'w' ? 'black' : 'white'
      termination = 'checkmate'
    } else if (this.chess.isStalemate()) {
      termination = 'stalemate'
    } else {
      termination = 'agreement'
    }
    this.result = result
    this.termination = termination
    this.status = 'finished'
    return { over: true, result, termination }
  }

  setResign(color: PieceColor) {
    this.result = color === 'white' ? 'black' : 'white'
    this.termination = 'resignation'
    this.status = 'finished'
  }

  setDraw() {
    this.result = 'draw'
    this.termination = 'agreement'
    this.status = 'finished'
  }

  get isFull() { return this.players.length >= 2 }
  get isActive() { return this.status === 'playing' }
  get isExpired() { return Date.now() - this.createdAt > 2 * 60 * 60 * 1000 } // 2h
}
