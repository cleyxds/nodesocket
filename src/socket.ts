import express from 'express'
import { createServer } from 'http'

import { Server as SocketServer } from 'socket.io'

import { Kafka, logLevel } from 'kafkajs'

import dotenv from 'dotenv'
dotenv.config()

const POWER_TOPIC = 'POWER_SENSORS'
const groupId = 'POWER-GROUP-CONSUMER'

const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT
const KAFKA_BROKERS = process.env.KAFKA_BROKERS

const app = express()

const kafka = new Kafka({
  clientId: 'ELECKTRA-CONSUMER',
  brokers: [KAFKA_BROKERS],
  logLevel: logLevel.NOTHING,
})

const httpServer = createServer(app)

const io = new SocketServer(httpServer, {
  cors: {
    origin: `*`,
    methods: ['GET', 'POST']
  }
})

const consumer = kafka.consumer({ groupId })

const initializeConsumer = async (consume: boolean) => {
  await consumer.connect()
    .then(() => console.log(`Consumer connected`))

  await consumer.subscribe({ topic: POWER_TOPIC })
    .then(() => console.log(`Consumer subscribed`))

  if (consume) {
    await consumer.run({
      eachMessage: async ({ message }) => {
        const measurement = JSON.parse(message.value.toString())
        console.log(measurement)
      }
    })
  }
}

initializeConsumer(false).catch(error => console.log(`Consumer not connected, cause => ${error}`))

io.on('connection', async socket => {
  console.log(`New client connected ${socket.id}`)

  socket.on('disconnect', reason => {
    console.log(`Client disconnected ${socket.id} for ${reason}`)
  })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const measurement = JSON.parse(message.value.toString())
      socket.emit('measurement', measurement)
      socket.broadcast.emit('measurement', measurement)
    },
  })
})

httpServer.listen(SOCKET_IO_PORT, () => console.log(`Socket.io ready on port ${SOCKET_IO_PORT}`))
