export type GameResult = 'white' | 'black' | 'draw'
export type Termination = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'agreement'
export type PieceColor = 'white' | 'black'
export type GameMode = 'casual' | 'rated' | 'arena'

export interface RoomPlayer {
  userId: string
  username: string
  color: PieceColor
  elo: number
  socketId: string
  connected: boolean
}

export interface RoomState {
  roomId: string
  players: RoomPlayer[]
  fen: string
  pgn: string
  status: 'waiting' | 'playing' | 'finished'
  coinStake: number
  mode: GameMode
  timeControl: string | null
  result?: GameResult
  termination?: Termination
  createdAt: number
}
