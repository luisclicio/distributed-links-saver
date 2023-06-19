import express from 'express';
import { MongoClient } from 'mongodb';
import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'links';

const app = express();
const mongoClient = new MongoClient(MONGO_URL);
const amqpConnection = await amqp.connect(RABBITMQ_URL);
const amqpChannel = await amqpConnection.createChannel();

app.use(express.json());

async function getCollection(name) {
  await mongoClient.connect();
  const database = mongoClient.db('links-saver');
  const collection = database.collection(name);
  return collection;
}

async function sendToQueue(queueName, data) {
  await amqpChannel.assertQueue(queueName, { durable: true });
  amqpChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
}

app.post('/links', async (req, res) => {
  const { links = [] } = req.body;

  try {
    links?.forEach(async (link) => await sendToQueue(QUEUE_NAME, link));
    return res.status(201).send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false });
  }
});

app.get('/links', async (req, res) => {
  try {
    const collection = await getCollection('links');
    const links = await collection.find().toArray();

    return res.status(200).send({
      success: true,
      links,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      links: [],
    });
  } finally {
    await mongoClient.close();
  }
});

app.listen(PORT, () => {
  console.log(`=> Server listening on port ${PORT}...`);
});

process.on('uncaughtException', async (error) => {
  console.error(error);
  await mongoClient.close();
  await amqpConnection.close();
  process.exit(1);
});
