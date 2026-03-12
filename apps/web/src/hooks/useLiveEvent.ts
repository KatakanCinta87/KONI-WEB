import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const useLiveEvent = (eventId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    if (!eventId) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to socket')
      setIsConnected(true)
      newSocket.emit('join-event', eventId)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket')
      setIsConnected(false)
    })

    newSocket.on('score:updated', (data) => {
      console.log('Score updated:', data)
      setLastUpdate(new Date())
      // Custom event to notify other components if they don't use this hook
      window.dispatchEvent(new CustomEvent('live-update', { detail: { type: 'score', data } }))
    })

    newSocket.on('medal:updated', (data) => {
      console.log('Medal updated:', data)
      setLastUpdate(new Date())
      window.dispatchEvent(new CustomEvent('live-update', { detail: { type: 'medal', data } }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('leave-event', eventId)
      newSocket.close()
    }
  }, [eventId])

  return { socket, isConnected, lastUpdate }
}
