import { Kafka, logLevel } from 'kafkajs'

import dotenv from 'dotenv'
dotenv.config()

const KAFKA_BROKERS = process.env.KAFKA_BROKERS

const POWER_TOPIC = 'POWER_SENSORS'
const GROUP_ID = 'POWER-GROUP-CONSUMER'

const kafka = new Kafka({
  brokers: [KAFKA_BROKERS],
  logLevel: logLevel.NOTHING,
})

export const consumer = kafka.consumer({ groupId: GROUP_ID })

const initializeConsumer = async (consume: boolean) => {
  await consumer.connect()
    .then(() => console.log(`Consumer connected`))
    .catch(reason => 
      console.log(`Error on connect consumer, reason => ${reason}\n@${new Date()}`))

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
