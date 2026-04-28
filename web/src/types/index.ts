export type GameMode = 'casual' | 'rated' | 'arena' | 'ai'
export type GameResult = 'white' | 'black' | 'draw'
export type Termination = 'checkmate' | 'resignation' | 'stalemate' | 'timeout' | 'agreement'
export type PieceColor = 'white' | 'black'

export interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  city: string | null
  elo: number
  coins: number
  is_pro: boolean
  piece_skin: 'classic' | 'medieval' | 'neon'
  board_theme: string
  created_at: string
}

export interface Game {
  id: string
  white_id: string | null
  black_id: string | null
  winner_id: string | null
  result: GameResult
  termination: Termination
  pgn: string
  time_control: string | null
  mode: GameMode
  analysis: MoveAnnotation[] | null
  white_elo_before: number | null
  black_elo_before: number | null
  white_elo_after: number | null
  black_elo_after: number | null
  coin_stake: number
  played_at: string
  white_profile?: UserProfile
  black_profile?: UserProfile
}

export interface MoveAnnotation {
  fen: string
  played: string
  best: string
  evalBefore: number
  evalAfter: number
  delta: number
  classification: 'brilliant' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
  moveNumber: number
  color: PieceColor
}

export interface RoomPlayer {
  userId: string
  username: string
  color: PieceColor
  elo: number
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
}

export interface SocketMove {
  roomId: string
  from: string
  to: string
  promotion?: string
}
