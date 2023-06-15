const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const pageMetadata = await getPageMetadata({
    url: 'https://www.scrapingbee.com/blog/playwright-web-scraping/',
    headless: true,
  });

  console.log(pageMetadata);
})();

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
      url,
      title,
      description,
      screenshotPath,
      processDate: new Date(),
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
