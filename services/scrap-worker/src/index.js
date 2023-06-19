import { MongoClient } from 'mongodb';
import amqp from 'amqplib';

import { Scraper } from './scraper.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'links';

const mongoClient = new MongoClient(MONGO_URL);
const amqpConnection = await amqp.connect(RABBITMQ_URL);
const amqpChannel = await amqpConnection.createChannel();
const scraper = new Scraper();

await amqpChannel.assertQueue(QUEUE_NAME, { durable: true });
amqpChannel.prefetch(1); // Process one message at a time

async function getCollection(name) {
  await mongoClient.connect();
  const database = mongoClient.db('links-saver');
  const collection = database.collection(name);
  return collection;
}

function parseMessage(message) {
  return JSON.parse(message.content.toString());
}

amqpChannel.consume(
  QUEUE_NAME,
  async (message) => {
    try {
      const link = parseMessage(message);
      const collection = await getCollection('links');
      const pageMetadata = await scraper.getPageMetadata({ url: link });

      await collection.insertOne(pageMetadata);
      amqpChannel.ack(message);
    } catch (error) {
      console.error(error);
    } finally {
      await mongoClient.close();
    }
  },
  {
    noAck: false, // Manual acknowledgment
  }
);

process.on('uncaughtException', async (error) => {
  console.error(error);
  await mongoClient.close();
  await amqpConnection.close();
  process.exit(1);
});
