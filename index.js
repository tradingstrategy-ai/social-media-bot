import puppeteer from 'puppeteer';
import fs from 'fs';

const outputFile = process.argv[2];

if (!outputFile) {
  console.log('usage: node index.js [outputFile]');
  process.exit(0);
}

takeChartScreenshot(outputFile);

async function takeChartScreenshot(outputFile) {
  let browser;

  try {
    // Launch the browser
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to your page with the chart
    await page.goto('http://localhost:5173/strategies/base-ath');

    // Find the chart element by class name
    const chartElement = await page.$('.chart-container');

    if (!chartElement) {
      throw new Error('Chart element not found');
    }

    // Take screenshot of just the chart element
    const screenshot = await chartElement.screenshot({
      type: 'png'
    });

    // Output to file
    fs.writeFileSync(outputFile, screenshot);

  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
