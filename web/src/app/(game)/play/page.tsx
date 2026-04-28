'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Input } from '@/components/ui/input'
import { Bot, Users, Coins, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { connectSocket } from '@/lib/socket/client'

export default function PlayPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [joinRoomId, setJoinRoomId] = useState('')

  const createRoom = async () => {
    if (!user || !profile) { toast.error('Please sign in first'); return }
    setCreating(true)
    const socket = connectSocket()
    socket.once('roomCreated', ({ roomId }: { roomId: string }) => {
      setCreating(false)
      router.push(`/room/${roomId}`)
    })
    socket.once('error', (msg: string) => {
      toast.error(msg)
      setCreating(false)
    })
    socket.emit('createRoom', {
      userId: user.id,
      username: profile.username,
      color: 'random',
      coinStake: 0,
      mode: 'rated',
      elo: profile.elo,
    })
  }

  const joinRoom = () => {
    const id = joinRoomId.trim()
    if (!id) { toast.error('Enter a room ID'); return }
    router.push(`/room/${id}`)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Choose Your Game</h1>
          <p className="text-muted-foreground">Play against AI, challenge a friend, or enter the Arena</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* vs AI */}
          <Card className="border-border/50 bg-card/80 hover:border-primary/40 transition-colors group">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-1">Play vs AI</h2>
                <p className="text-sm text-muted-foreground">5 difficulty levels. Stockfish engine. Perfect for practice.</p>
              </div>
              <LinkButton href="/ai" className="w-full">
                Play Now <ChevronRight className="h-4 w-4 ml-1" />
              </LinkButton>
            </CardContent>
          </Card>

          {/* vs Friend */}
          <Card className="border-border/50 bg-card/80 hover:border-primary/40 transition-colors group">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-1">Play vs Friend</h2>
                <p className="text-sm text-muted-foreground">Create a room, share the link. Real-time multiplayer.</p>
              </div>
              <Button className="w-full" onClick={createRoom} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Room'}
              </Button>
              <div className="w-full">
                <div className="flex gap-2">
                  <Input
                    placeholder="Room ID to join..."
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="bg-input/50 text-sm h-8"
                    onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                  />
                  <Button size="sm" variant="outline" onClick={joinRoom} className="h-8 shrink-0">Join</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arena */}
          <Card className="border-primary/30 bg-card/80 hover:border-primary/60 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-6 flex flex-col items-center text-center gap-4 relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Coins className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-1">Chess Arena</h2>
                <p className="text-sm text-muted-foreground">Bet coins. Win big. ELO rating at stake.</p>
                {profile && (
                  <p className="text-xs text-primary font-semibold mt-1">Your balance: {profile.coins} 🪙</p>
                )}
              </div>
              <LinkButton href="/arena" className="w-full glow-gold">
                Enter Arena <ChevronRight className="h-4 w-4 ml-1" />
              </LinkButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
