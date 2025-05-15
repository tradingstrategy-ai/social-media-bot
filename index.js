import fs from 'fs';
import { getTimestamp } from './lib/timestamp.js';
import { takeScreenshot } from './lib/screenshot.js';

if (process.argv.length !== 3) {
  console.log('usage: node index.js [strategyId]');
  process.exit(1);
}

const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';
const strategyId = process.argv[2]
const timestamp = getTimestamp();
const outfile = `output/${strategyId}_${timestamp}.png`;

try {
  const screenshot = await takeScreenshot(`${baseUrl}/strategies/${strategyId}`, '.chart-container');
  fs.writeFileSync(outfile, screenshot);
} catch (error) {
  console.error('Error taking screenshot:', error);
  process.exit(1);
}
