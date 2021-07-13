import express from 'express'
import { createServer } from 'http'

import { Server as SocketServer } from 'socket.io'

import { consumer } from './kafka/consumer'

const SOCKET_IO_PORT = 33334

const app = express()

const httpServer = createServer(app)

const io = new SocketServer(httpServer, {
  cors: {
    origin: `*`,
    methods: ['GET', 'POST']
  }
})

io.on('connection', async socket => {
  console.log(`New client connected ${socket.id}`)

  socket.on('disconnect', reason => {
    console.log(`Client disconnected ${socket.id} for ${reason}`)
  })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const measurement = JSON.parse(message.value.toString())
      socket.broadcast.emit('measurement', measurement)
    },
  })
    .catch(reason => console.log(reason))
})

httpServer.listen(SOCKET_IO_PORT, () => console.log(`Socket.io ready on port ${SOCKET_IO_PORT}`))
