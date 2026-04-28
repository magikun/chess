'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Coins, AlertCircle } from 'lucide-react'

interface BetModalProps {
  open: boolean
  balance: number
  onConfirm: (stake: number) => void
  onCancel: () => void
}

export function BetModal({ open, balance, onConfirm, onCancel }: BetModalProps) {
  const max = Math.min(balance, 500)
  const [stake, setStake] = useState(Math.min(50, max))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm border-primary/30 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" /> Set Your Bet
          </DialogTitle>
          <DialogDescription>
            Winner takes all. Are you confident enough?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="text-center">
            <div className="text-4xl font-black text-primary mb-1">{stake}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Coins className="h-3.5 w-3.5" /> coins at stake
            </div>
          </div>
          <div className="space-y-2">
            <Slider
              min={10}
              max={max}
              step={10}
              value={stake}
              onValueChange={(v) => setStake(typeof v === 'number' ? v : (v as number[])[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>Your balance: {balance} 🪙</span>
              <span>{max}</span>
            </div>
          </div>
          {stake > balance * 0.7 && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-lg p-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Betting more than 70% of your balance — high risk!
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1 glow-gold" onClick={() => onConfirm(stake)}>
              Bet {stake} Coins
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
