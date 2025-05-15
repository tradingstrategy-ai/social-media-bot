import { takeScreenshot } from './lib/screenshot.js';
import fs from 'fs';

const outputFile = process.argv[2];

if (!outputFile) {
  console.log('usage: node index.js [outputFile]');
  process.exit(0);
}

takeChartScreenshot(outputFile);

async function takeChartScreenshot(outputFile) {
  try {
    const screenshot = await takeScreenshot('http://localhost:5173/strategies/base-ath', '.chart-container');
    fs.writeFileSync(outputFile, screenshot);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  }
}
