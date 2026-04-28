import { LinkButton } from '@/components/ui/link-button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Crown, Zap, Users, Bot, Trophy, Coins, ChevronRight, Brain, Globe
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Real-time Multiplayer',
    description: 'Challenge friends instantly with a shareable link. WebSocket-powered — moves sync in under 50ms.',
    badge: 'WebSocket',
  },
  {
    icon: Bot,
    title: 'AI Opponent',
    description: 'Train against Stockfish at 5 difficulty levels — from beginner to grandmaster strength.',
    badge: 'Stockfish',
  },
  {
    icon: Brain,
    title: 'AI Coach',
    description: 'Full move-by-move post-game analysis. See your blunders, mistakes, and what you should have played.',
    badge: 'Post-game',
  },
  {
    icon: Coins,
    title: 'Chess Arena',
    description: 'Bet your earned coins on games. Win big, climb the ranks — prove you are the best.',
    badge: 'Unique',
  },
  {
    icon: Globe,
    title: 'City Leaderboard',
    description: 'Compete for the #1 spot in your city. ELO-based global rankings updated after every game.',
    badge: 'Social',
  },
  {
    icon: Zap,
    title: 'Pro Skins',
    description: 'Unlock medieval and neon piece sets and premium board themes. Stand out on the board.',
    badge: 'Pro',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-24 text-center">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
            <Crown className="h-3 w-3 mr-1.5 text-primary inline" />
            The Chess Platform Built Different
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Play Chess.{' '}
            <span className="text-primary">Earn Coins.</span>
            <br />
            <span className="text-muted-foreground text-4xl md:text-5xl font-bold">
              Dominate Your City.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Chess Arena combines real-time multiplayer, an AI coaching system, and a
            coin betting arena — all in one premium platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton size="lg" href="/register" className="glow-gold text-base px-8 h-12">
              Start Playing Free <ChevronRight className="ml-1 h-4 w-4" />
            </LinkButton>
            <LinkButton size="lg" variant="outline" href="/ai" className="text-base px-8 h-12 border-border/60">
              Play vs AI →
            </LinkButton>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free account · 100 coins on signup · No credit card
          </p>
        </div>
      </section>

      {/* Static chess board preview */}
      <section className="py-8 container mx-auto px-4">
        <div className="relative max-w-xs mx-auto">
          <div className="aspect-square rounded-2xl overflow-hidden border border-border/50 shadow-2xl grid grid-cols-8">
            {Array.from({ length: 64 }).map((_, i) => {
              const row = Math.floor(i / 8)
              const col = i % 8
              const isDark = (row + col) % 2 === 1
              const pieces: Record<number, string> = {
                0: '♜', 1: '♞', 2: '♝', 3: '♛', 4: '♚', 5: '♝', 6: '♞', 7: '♜',
                8: '♟', 9: '♟', 10: '♟', 11: '♟', 12: '♟', 13: '♟', 14: '♟', 15: '♟',
                48: '♙', 49: '♙', 50: '♙', 51: '♙', 52: '♙', 53: '♙', 54: '♙', 55: '♙',
                56: '♖', 57: '♘', 58: '♗', 59: '♕', 60: '♔', 61: '♗', 62: '♘', 63: '♖',
              }
              return (
                <div
                  key={i}
                  className={`flex items-center justify-center text-base select-none aspect-square ${
                    isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'
                  }`}
                >
                  <span className={i < 16 ? 'text-gray-900' : 'text-white drop-shadow'}>
                    {pieces[i] ?? ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold shadow-lg animate-pulse">
            LIVE
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">Everything You Need to Dominate</h2>
          <p className="text-muted-foreground">Built for serious players, accessible to everyone</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description, badge }) => (
            <Card key={title} className="bg-card/60 border-border/50 hover:border-primary/30 transition-colors group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{badge}</Badge>
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-3">Ready to Climb the Rankings?</h2>
          <p className="text-muted-foreground mb-8">
            Join players competing in Chess Arena. Your city is watching.
          </p>
          <LinkButton size="lg" href="/register" className="glow-gold text-base px-10 h-12">
            Create Free Account
          </LinkButton>
        </div>
      </section>

      <footer className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
        <p>Chess Arena © 2026 — Built for the competitors</p>
      </footer>
    </div>
  )
}
