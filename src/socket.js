import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Kafka, logLevel } from 'kafkajs';

const SOCKET_IO_PORT = 33334
const POWER_TOPIC = 'POWER_SENSORS';
const groupId = 'POWER-GROUP-CONSUMER';

const app = express();

const kafka = new Kafka({
  clientId: 'ELECKTRA-CONSUMER',
  brokers: ['localhost:9092'],
  logLevel: logLevel.NOTHING,
});

const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: `*`,
    methods: ['GET', 'POST']
  }
});

const consumer = kafka.consumer({ groupId });

const startConsume = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: POWER_TOPIC })
}

startConsume().catch(console.error);

io.on('connection', async socket => {
  console.log(`New client connected ${socket.id}`);

  socket.on('disconnect', reason => {
    console.log(`Client disconnected ${socket.id} for ${reason}`);
  });

  const consume = async () => {
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const measurement = JSON.parse(message.value.toString());
        socket.emit('measurement', measurement);
        socket.broadcast.emit('measurement', measurement);
      },
    })
  }

  consume().catch(e => console.log('Something went wrong :(', e))

});

httpServer.listen(SOCKET_IO_PORT, () => {console.log(`Socket.io ready on port ${SOCKET_IO_PORT}`)});
