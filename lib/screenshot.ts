import puppeteer from 'puppeteer';

export async function takeScreenshot(url: string, selector: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url);
    const node = await page.$(selector);

    if (node) {
      return await node.screenshot({ type: 'png' });
    } else {
      throw new Error(`Node matching selector "${selector}" not found`);
    }
  } finally {
    await browser?.close();
  }
}
