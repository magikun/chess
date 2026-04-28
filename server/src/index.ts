import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { RoomManager } from './rooms/RoomManager'
import { registerRoomHandlers } from './handlers/roomHandler'
import { registerGameHandlers } from './handlers/gameHandler'

const app = express()
const httpServer = createServer(app)

const origins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',')

const io = new Server(httpServer, {
  cors: {
    origin: origins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

app.use(cors({ origin: origins, credentials: true }))
app.use(express.json())

const manager = new RoomManager()

app.get('/health', (_req, res) => res.json({ status: 'ok', rooms: manager.size }))

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} connected`)
  registerRoomHandlers(io, socket, manager)
  registerGameHandlers(io, socket, manager)
  socket.on('disconnect', () => console.log(`[-] ${socket.id} disconnected`))
})

// Clean expired rooms every 30 minutes
setInterval(() => manager.cleanExpired(), 30 * 60 * 1000)

const PORT = parseInt(process.env.PORT ?? '3001')
httpServer.listen(PORT, () => console.log(`Chess server running on :${PORT}`))
