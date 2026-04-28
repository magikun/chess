'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Crown, Coins, Trophy, Clock, User, LogOut, Zap, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/history', label: 'History' },
]

export function Header() {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Crown className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:block">Chess Arena</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user && profile ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-primary">{profile.coins}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-semibold">{profile.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{profile.elo} ELO</Badge>
                      {profile.is_pro && (
                        <Badge className="text-xs bg-primary text-primary-foreground">PRO</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/profile/${profile.username}`)}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/history')}>
                    <Clock className="h-4 w-4 mr-2" /> Game History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/leaderboard')}>
                    <Trophy className="h-4 w-4 mr-2" /> Leaderboard
                  </DropdownMenuItem>
                  {!profile.is_pro && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/pro')} className="text-primary font-medium">
                        <Zap className="h-4 w-4 mr-2" /> Upgrade to Pro
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <LinkButton variant="ghost" size="sm" href="/login">Sign In</LinkButton>
              <LinkButton size="sm" href="/register" className="glow-gold">Get Started</LinkButton>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
