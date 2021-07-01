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
  retry: {
    initialRetryTime: 300,
    retries: 20
  },
});

const httpServer = createServer(app);
const io = new SocketServer(httpServer);

let data = {};

const consumer = kafka.consumer({ groupId });

const consume = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: POWER_TOPIC, fromBeginning: true })
 
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const measurement = JSON.parse(message.value.toString());
      data = measurement
      console.log(measurement);
    },
  })
}

consume().catch(e => console.log('Something went wrong :(', e))

io.on('connection', async socket => {
  console.log(`${socket.id} connected`);
  
  socket.emit('measurement', data)

});

httpServer.listen(SOCKET_IO_PORT, () => {console.log(`Socket.io ready on port ${SOCKET_IO_PORT}`)});
