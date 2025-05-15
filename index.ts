import fs from 'fs';
import type { PerformanceSummary } from './lib/types.ts';
import { getTimestamp } from './lib/timestamp.ts';
import { takeScreenshot } from './lib/screenshot.ts';

if (process.argv.length !== 3) {
  console.log('usage: node index.js [strategyId]');
  process.exit(1);
}

const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';
const strategyId = process.argv[2]
const timestamp = getTimestamp();
const outfile = `output/${strategyId}_${timestamp}.png`;

const performanceTrigger = await checkPerformance(baseUrl, strategyId);

if (performanceTrigger) {
  console.log('Social media post triggered:');
  console.log(JSON.stringify(performanceTrigger));
  takeStrategyScreenshot(baseUrl, strategyId, outfile);
} else {
  console.log('No social media post triggered');
}

async function checkPerformance(baseUrl: string, stragegyId: string) {
  const resp = await fetch(`${baseUrl}/strategies/${strategyId}/period-performance`);
  const summaries = (await resp.json()) as PerformanceSummary[];

  // sort by performance, best performing first
  summaries.sort((a, b) => b.performance - a.performance);

  // get the best performing timeframe; return it if over threshold
  const bestTimeframe = summaries[0];
  return bestTimeframe.performance > 0.05 ? bestTimeframe : undefined;
}

async function takeStrategyScreenshot(baseUrl: string, strategyId: string, outfile: string) {
  try {
    const screenshot = await takeScreenshot(`${baseUrl}/strategies/${strategyId}`, '.chart-container');
    fs.writeFileSync(outfile, screenshot);
  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  }
}
