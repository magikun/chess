import { Room } from './Room'
import type { GameMode } from '../types'

export class RoomManager {
  private rooms = new Map<string, Room>()

  create(coinStake = 0, mode: GameMode = 'rated', timeControl: string | null = null): Room {
    const roomId = this.generateId()
    const room = new Room(roomId, coinStake, mode, timeControl)
    this.rooms.set(roomId, room)
    return room
  }

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  delete(roomId: string) {
    this.rooms.delete(roomId)
  }

  get size(): number {
    return this.rooms.size
  }

  cleanExpired() {
    for (const [id, room] of this.rooms) {
      if (room.isExpired) this.rooms.delete(id)
    }
  }

  private generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let id = ''
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
    return id
  }
}
