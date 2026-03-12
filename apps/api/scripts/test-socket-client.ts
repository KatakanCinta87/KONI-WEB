import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

async function testSocket() {
  console.log('--- Testing Socket.IO Connection ---')
  
  const socket = io(SOCKET_URL)

  socket.on('connect', () => {
    console.log('✅ Connected to server!')
    console.log('Joining event room...')
    socket.emit('join-event', 'test-event-id')
  })

  socket.on('score:updated', (data) => {
    console.log('✅ Received score update:', data)
    socket.disconnect()
    process.exit(0)
  })

  socket.on('medal:updated', (data) => {
    console.log('✅ Received medal update:', data)
  })

  socket.on('connect_error', (err) => {
    console.log('❌ Connection error:', err.message)
    process.exit(1)
  })

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('❌ Test timed out')
    socket.disconnect()
    process.exit(1)
  }, 10000)
}

testSocket()
