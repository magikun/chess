'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, Zap, Palette, Brain, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const PRO_FEATURES = [
  { icon: Palette, title: 'Custom Piece Skins', desc: 'Medieval & Neon piece sets' },
  { icon: Palette, title: 'Board Themes', desc: 'Dark wood, marble, and more' },
  { icon: Brain, title: 'Advanced AI Coach', desc: 'Deep analysis up to depth 22' },
  { icon: Trophy, title: 'Pro Badge', desc: 'Stand out on the leaderboard' },
  { icon: Zap, title: 'Priority Matchmaking', desc: 'Find opponents faster in Arena' },
  { icon: Crown, title: 'Exclusive Titles', desc: '"Pro Player" title on profile' },
]

const SKINS = [
  { id: 'classic', name: 'Classic', preview: '♔♕♖♗♘♙', locked: false },
  { id: 'medieval', name: 'Medieval', preview: '⚜️🏰🗡️', locked: true },
  { id: 'neon', name: 'Neon', preview: '🎮⚡🔥', locked: true },
]

export default function ProPage() {
  const { profile } = useAuth()
  const [showPayment, setShowPayment] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleUpgrade = () => {
    if (profile?.is_pro) { toast.info('You are already Pro!'); return }
    setShowPayment(true)
  }

  const handleMockPayment = async () => {
    setProcessing(true)
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000))
    setProcessing(false)
    setShowPayment(false)
    toast.success('🎉 Welcome to Chess Arena Pro! Refresh to see your new features.')
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 mb-4">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black mb-3">
            Upgrade to <span className="text-primary">Pro</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full Chess Arena experience. Custom skins, deeper analysis, and elite status.
          </p>
          {profile?.is_pro && (
            <Badge className="mt-4 bg-primary text-primary-foreground px-4 py-1.5 text-sm">
              <Crown className="h-4 w-4 mr-2" /> You are already Pro!
            </Badge>
          )}
        </div>

        {/* Pricing card */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <Card className="flex-1 border-border/50 bg-card/60">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-muted-foreground">Free</CardTitle>
              <div className="text-4xl font-black mt-2">$0</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Unlimited casual games', 'vs AI (5 levels)', 'City leaderboard', '100 starting coins'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 shrink-0" /> {f}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex-1 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 glow-gold relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground text-xs">MOST POPULAR</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-primary flex items-center justify-center gap-2">
                <Crown className="h-5 w-5" /> Pro
              </CardTitle>
              <div className="text-4xl font-black mt-2">$9<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Everything in Free', ...PRO_FEATURES.map((f) => f.title)].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                </div>
              ))}
              <Button className="w-full mt-4 glow-gold" size="lg" onClick={handleUpgrade} disabled={profile?.is_pro}>
                {profile?.is_pro ? 'Already Pro' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Piece skins showcase */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Piece Skin Showcase</h2>
          <div className="grid grid-cols-3 gap-3">
            {SKINS.map((skin) => (
              <Card
                key={skin.id}
                className={`border-border/50 bg-card/60 text-center p-4 relative ${
                  skin.locked ? 'opacity-60' : ''
                }`}
              >
                {skin.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-sm">
                    <div className="text-center">
                      <Crown className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-xs font-bold text-primary">Pro Only</span>
                    </div>
                  </div>
                )}
                <div className="text-3xl mb-2">{skin.preview}</div>
                <div className="text-sm font-semibold">{skin.name}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRO_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-card/40 border border-border/30">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock payment dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-sm border-primary/30 bg-card/95 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" /> Upgrade to Pro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Chess Arena Pro</span>
                <span className="font-bold">$9.00/mo</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Billed monthly</span>
                <span>Cancel anytime</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                4242 4242 4242 4242
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                  12/28
                </div>
                <div className="h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                  123
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              🔒 Demo mode — no real charge will occur
            </p>
            <Button className="w-full glow-gold" onClick={handleMockPayment} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay $9.00 →'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
