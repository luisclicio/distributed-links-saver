import { MongoClient } from 'mongodb';

import { Scraper } from './scraper.js';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';

const mongoClient = new MongoClient(MONGO_URL);
const scraper = new Scraper();

async function getCollection(name) {
  await mongoClient.connect();
  const database = mongoClient.db('links-saver');
  const collection = database.collection(name);
  return collection;
}

(async () => {
  try {
    const collection = await getCollection('links');
    const pageMetadata = await scraper.getPageMetadata({
      url: 'https://www.scrapingbee.com/blog/playwright-web-scraping/',
    });

    await collection.insertOne(pageMetadata);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoClient.close();
  }
})();

process.on('uncaughtException', async (error) => {
  console.error(error);
  await mongoClient.close();
  process.exit(1);
});
