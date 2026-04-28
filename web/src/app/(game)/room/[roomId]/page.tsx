import { MultiplayerGame } from '@/components/game/MultiplayerGame'

interface Props {
  params: Promise<{ roomId: string }>
}

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params
  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 mb-4 text-center">
        <h1 className="text-xl font-bold">Room: <code className="text-primary">{roomId}</code></h1>
      </div>
      <MultiplayerGame roomId={roomId} />
    </div>
  )
}
