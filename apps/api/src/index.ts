import { createServer } from 'http'
import { initCronJobs } from './services/cron.service.js'
import { initSocket } from './socket.js'
import { app } from './app.js'

const httpServer = createServer(app)
const PORT = process.env.PORT || 3000

initSocket(httpServer)
initCronJobs()

httpServer.listen(PORT, () => {
  console.log(`
  KONI Kabupaten Malang API Server
  Running on http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  `)
})
