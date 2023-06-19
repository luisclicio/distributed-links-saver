import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

const app = express();
const mongoClient = new MongoClient(MONGO_URL);

app.use(express.json());

async function getCollection(name) {
  await mongoClient.connect();
  const database = mongoClient.db('links-saver');
  const collection = database.collection(name);
  return collection;
}

app.post('/links', async (req, res) => {
  const { url } = req.body;

  try {
    // insert link to rabbitmq

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
  process.exit(1);
});
