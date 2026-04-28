import { createClient } from '@supabase/supabase-js'
import { computeNewRatings } from '../utils/elo'
import type { Room } from '../rooms/Room'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function saveGame(room: Room): Promise<string | null> {
  if (!room.result || !room.termination) return null

  const [white, black] = room.players.sort((a, b) => (a.color === 'white' ? -1 : 1))
  if (!white || !black) return null

  let whiteEloBefore = white.elo
  let blackEloBefore = black.elo
  let whiteEloAfter = white.elo
  let blackEloAfter = black.elo

  if (room.mode === 'rated' || room.mode === 'arena') {
    const { newWhiteElo, newBlackElo } = computeNewRatings(whiteEloBefore, blackEloBefore, room.result)
    whiteEloAfter = newWhiteElo
    blackEloAfter = newBlackElo

    await Promise.all([
      supabase.from('profiles').update({ elo: newWhiteElo }).eq('id', white.userId),
      supabase.from('profiles').update({ elo: newBlackElo }).eq('id', black.userId),
    ])
  }

  if (room.mode === 'arena' && room.coinStake > 0 && room.result !== 'draw') {
    const winnerId = room.result === 'white' ? white.userId : black.userId
    const loserId = room.result === 'white' ? black.userId : white.userId
    await supabase.rpc('transfer_coins', {
      from_user_id: loserId,
      to_user_id: winnerId,
      amount: room.coinStake,
    })
  }

  const winnerId = room.result === 'draw' ? null
    : room.result === 'white' ? white.userId
    : black.userId

  const { data, error } = await supabase.from('games').insert({
    white_id: white.userId,
    black_id: black.userId,
    winner_id: winnerId,
    result: room.result,
    termination: room.termination,
    pgn: room.chess.pgn(),
    mode: room.mode,
    time_control: room.timeControl,
    coin_stake: room.coinStake,
    white_elo_before: whiteEloBefore,
    black_elo_before: blackEloBefore,
    white_elo_after: whiteEloAfter,
    black_elo_after: blackEloAfter,
  }).select('id').single()

  if (error) { console.error('saveGame error:', error); return null }
  return data?.id ?? null
}
