const { chromium } = require('playwright');
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3333;

app.use(express.json());
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function checkURLTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS url (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        img VARCHAR(255),
        url TEXT
      );
    `;
    await pool.query(createTableQuery);
    console.log("Tabela de URL verificada ou criada com sucesso");
  } catch (error) {
    console.error("Erro ao verificar ou criar tabela de URL:", error);
  }
}

app.post('/addURL', async (req, res) => {
  const urlA = req.body.url;

  const pageMetadata = await getPageMetadata({
    url: urlA,
    headless: true,
  });


  console.log(pageMetadata);

  try{
      const { newUbs } = await pool.query('INSERT INTO url (title, description, img, url) VALUES ($1, $2, $3, $4)', [pageMetadata.title, pageMetadata.description, pageMetadata.screenshotPath, urlA])
      return res.status(201).send("URL cadastrada com sucesso")
  } catch(erro) {
      res.status(500).send(erro);
  }
})

app.get('/allURL', async (req, res) => {
  try{
    const { rows } = await pool.query(`SELECT * FROM url`)
    return res.status(200).send(rows)
  } catch(erro) {
      return res.status(400).send(erro)
  }
})


async function getBrowser({ headless = false }) {
  try {
    const browser = await chromium.launch({ headless, slowMo: 50 });
    return browser;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getPageMetadata({ url, headless = false }) {
  const browser = await getBrowser({ headless });

  if (!browser) {
    return null;
  }

  try {
    const page = await browser.newPage();
    await page.goto(url);
    const title = await page.title();
    const description = await getDescription({ page });
    const screenshotPath = await saveScreenshot({ page });

    return {
      title,
      description,
      screenshotPath,
    };
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    await browser.close();
  }
}

async function getDescription({ page }) {
  try {
    const description = await page.$eval(
      'meta[name="description"]',
      (element) => element.getAttribute('content')
    );

    return description;
  } catch (error) {
    console.error(error);
    return '';
  }
}

async function saveScreenshot({ page, folder = 'screenshots' }) {
  try {
    const randomID = Math.random().toString(36).substring(7); // Trocar por UUID ao invés de random
    const filePath = path.join(folder, `${randomID}.png`);
    await page.screenshot({ path: filePath });
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}

checkURLTable().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});