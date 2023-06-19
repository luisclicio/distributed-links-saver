import crypto from 'crypto';
import path from 'path';
import { chromium } from 'playwright';

export class Scraper {
  constructor({ headless = true, devtools = false } = {}) {
    this._headless = headless;
    this._devtools = devtools;
  }

  async loadBrowser() {
    if (this._browser) {
      return;
    }

    this._browser = await this.getBrowser();
  }

  async getBrowser() {
    try {
      const browser = await chromium.launch({
        headless: this._headless,
        devtools: this._devtools,
      });
      return browser;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getPageMetadata({ url }) {
    await this.loadBrowser();

    if (!this._browser) {
      return null;
    }

    try {
      const page = await this._browser.newPage();
      await page.goto(url);
      const title = await page.title();
      const description = await this.getDescription({ page });
      const screenshotFileName = await this.saveScreenshot({ page });

      return {
        url,
        title,
        description,
        screenshotFileName,
        processDate: new Date(),
      };
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      await this._browser.close();
      this._browser = null;
    }
  }

  async getDescription({ page }) {
    try {
      const description = await page.$eval(
        'meta[name="description"]',
        (element) => element.getAttribute('content')
      );

      return description;
    } catch (error) {
      console.warn(error);
      return '';
    }
  }

  async saveScreenshot({ page, folder = 'screenshots' }) {
    try {
      const randomID = this.getRandomID();
      const fileName = `${randomID}.png`;
      const filePath = path.join(folder, fileName);
      await page.screenshot({ path: filePath });
      return fileName;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  getRandomID() {
    return crypto.randomBytes(8).toString('hex');
  }
}
