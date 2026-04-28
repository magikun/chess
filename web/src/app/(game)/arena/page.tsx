'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BetModal } from '@/components/arena/BetModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Coins, Trophy, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { connectSocket } from '@/lib/socket/client'

export default function ArenaPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [showBet, setShowBet] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joinId, setJoinId] = useState('')

  const handleCreateRoom = (stake: number) => {
    if (!user || !profile) return
    setShowBet(false)
    setCreating(true)
    const socket = connectSocket()
    socket.once('roomCreated', ({ roomId }: { roomId: string }) => {
      setCreating(false)
      router.push(`/room/${roomId}?stake=${stake}`)
    })
    socket.once('error', (msg: string) => {
      toast.error(msg)
      setCreating(false)
    })
    socket.emit('createRoom', {
      userId: user.id,
      username: profile.username,
      color: 'random',
      coinStake: stake,
      mode: 'arena',
      elo: profile.elo,
    })
  }

  const joinRoom = () => {
    const id = joinId.trim()
    if (!id) { toast.error('Enter a room ID'); return }
    router.push(`/room/${id}`)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-4">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-2">Chess Arena</h1>
          <p className="text-muted-foreground">Put your coins on the line. Win big. Climb the ranks.</p>
          {profile && (
            <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{profile.coins} coins available</span>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <Card className="border-primary/30 bg-card/80 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold">Create Arena Room</h2>
                  <p className="text-sm text-muted-foreground">Set a coin stake and invite your opponent</p>
                </div>
              </div>
              <Button
                className="w-full glow-gold"
                onClick={() => {
                  if (!profile) { toast.error('Please sign in'); return }
                  if (profile.coins < 10) { toast.error('You need at least 10 coins'); return }
                  setShowBet(true)
                }}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Coins className="h-4 w-4 mr-2" />Set Stake & Create Room</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-bold">Join Arena Room</h2>
                  <p className="text-sm text-muted-foreground">Enter a room ID shared by your opponent</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room ID..."
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="bg-input/50"
                  onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                />
                <Button variant="outline" onClick={joinRoom} className="shrink-0">Join</Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground space-y-1 pt-2">
            <p>🏆 Arena games are rated — your ELO changes</p>
            <p>💰 Winner takes the entire coin stake</p>
            <p>🤝 Draw? No coins change hands</p>
          </div>
        </div>
      </div>

      <BetModal
        open={showBet}
        balance={profile?.coins ?? 0}
        onConfirm={handleCreateRoom}
        onCancel={() => setShowBet(false)}
      />
    </div>
  )
}
