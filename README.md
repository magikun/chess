# Chess Arena 🏆

**Play Chess. Earn Coins. Dominate Your City.**

A full "Level Great" chess web platform — real-time multiplayer, AI coaching, coin betting, and city leaderboards. Built as a startup prototype, not just a chess board.

---

## What Was Built

### Core
- ♟ **Full chess rules** via `chess.js` — castling, en passant, promotion, checkmate, stalemate, draw
- 🤖 **AI opponent** via Stockfish WASM (Web Worker) — 5 difficulty levels (Beginner → Master)
- 🌐 **Real-time multiplayer** via Socket.io — shareable room links, authoritative server-side move validation
- 💾 **Auth + persistence** via Supabase — login, register, game history, ELO tracking

### Unique Features (what makes it "Great")
- 🧠 **AI Coach** — post-game analysis that evaluates every move at depth 16-18, classifies Blunders/Mistakes/Inaccuracies, shows best-move arrows on the board, and caches results in the database
- 🪙 **Chess Arena** — coin betting system where players stake internal coins on games. Atomic DB transfers ensure fairness. ELO rating changes too.
- 🏙 **City Leaderboard** — ELO-ranked global leaderboard filterable by city, with player profiles and follow system
- 👑 **Pro tier** — mock Stripe checkout for premium piece skins (Medieval, Neon), Pro badge on profile

### Tech Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Chess:** chess.js + react-chessboard
- **AI:** Stockfish WASM (lichess build) in Web Worker
- **Realtime:** Socket.io (standalone Express server)
- **Database/Auth:** Supabase (PostgreSQL + Row Level Security)
- **Design:** Dark premium theme with gold/amber accents

---

## For Whom & Why It's Valuable

**Target users:** casual-to-serious chess players who want more than just a board.

**Why it's valuable:**
1. **Retention loop:** coins + ELO + city rankings give players reasons to return daily
2. **Learning loop:** AI Coach means every loss becomes a lesson, not just a loss
3. **Social layer:** city leaderboards create local competition (Almaty #1, etc.)
4. **Monetization:** Pro tier with cosmetics is a proven model (chess.com, lichess patrons)

**Business model:** freemium — free forever with coins/ELO, Pro at $9/mo for skins + perks

---

## Setup

### 1. Supabase
Create a project at [supabase.com](https://supabase.com) and run the SQL from `supabase/schema.sql`.

### 2. Stockfish WASM
Download from [lichess-org/stockfish.wasm](https://github.com/lichess-org/stockfish.wasm/releases) and place `stockfish.js` + `stockfish.wasm` in `web/public/stockfish/`.

### 3. Environment
```bash
# web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# server/.env
PORT=3001
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Run (development)
```bash
# Terminal 1 — Socket.io server
cd server && npm run dev

# Terminal 2 — Next.js app
cd web && npm run dev
```

### 5. Build (production)
```bash
cd web && npm run build
```

---

## Database Schema

Run in Supabase SQL editor:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  city TEXT,
  elo INTEGER NOT NULL DEFAULT 1200,
  coins INTEGER NOT NULL DEFAULT 100,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  piece_skin TEXT NOT NULL DEFAULT 'classic',
  board_theme TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_id UUID REFERENCES profiles(id),
  black_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  result TEXT NOT NULL,
  termination TEXT NOT NULL,
  pgn TEXT NOT NULL,
  time_control TEXT,
  mode TEXT NOT NULL DEFAULT 'casual',
  analysis JSONB,
  white_elo_before INTEGER, black_elo_before INTEGER,
  white_elo_after INTEGER, black_elo_after INTEGER,
  coin_stake INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own update" ON profiles FOR UPDATE USING (auth.uid() = id);
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON games FOR SELECT USING (true);
CREATE POLICY "Service insert" ON games FOR INSERT WITH CHECK (true);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON follows FOR SELECT USING (true);
CREATE POLICY "Own manage" ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE OR REPLACE FUNCTION transfer_coins(from_user_id UUID, to_user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET coins = coins - amount WHERE id = from_user_id AND coins >= amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient coins'; END IF;
  UPDATE profiles SET coins = coins + amount WHERE id = to_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Deploy

### Next.js → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `magikun/chess`
2. Set **Root Directory** to `web`
3. Add these **Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   NEXT_PUBLIC_SOCKET_URL=https://your-railway-server.up.railway.app
   NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
   ```
4. **Build command:** `npm run build` (Vercel auto-detects this)
5. Click **Deploy**

### Socket.io server → Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select `magikun/chess`
2. Set **Root Directory** to `server`
3. Set **Start command** to `npm run build && node dist/index.js`
4. Add **Environment Variables**:
   ```
   PORT=3001
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
5. After deploy, copy the Railway URL and update `NEXT_PUBLIC_SOCKET_URL` in Vercel

---

## What I Would Add With More Time

- ⏱ Chess clocks (time controls)
- 🎭 Spectator mode in live games
- 📊 ELO chart over time on profile
- 🔔 Push notifications for "your turn"
- 🏆 Tournament brackets
- 🎵 Sound effects

---

*Built for nfactorial Chess Hackathon 2026 · [nfactorialschool.typeform.com/to/HYVeKeEx](https://nfactorialschool.typeform.com/to/HYVeKeEx)*
