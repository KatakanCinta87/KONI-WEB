import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: Server

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || ''
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-event', (eventId: string) => {
      socket.join(`event_${eventId}`)
      console.log(`Socket ${socket.id} joined event_${eventId}`)
    })

    socket.on('leave-event', (eventId: string) => {
      socket.leave(`event_${eventId}`)
      console.log(`Socket ${socket.id} left event_${eventId}`)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}

export const emitScoreUpdate = (eventId: string, data: any) => {
  if (io) {
    io.to(`event_${eventId}`).emit('score:updated', data)
  }
}

export const emitMedalUpdate = (eventId: string, data: any) => {
  if (io) {
    io.to(`event_${eventId}`).emit('medal:updated', data)
  }
}
