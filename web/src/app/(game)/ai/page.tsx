import { AIGame } from '@/components/game/AIGame'

export default function AIPage() {
  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 mb-6 text-center">
        <h1 className="text-2xl font-black">Play vs AI</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Powered by Stockfish — adjust difficulty and start playing
        </p>
      </div>
      <AIGame playerColor="white" initialSkill={2} />
    </div>
  )
}
