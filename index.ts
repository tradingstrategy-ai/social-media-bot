import 'dotenv/config';
import type { PerformanceSummary } from './lib/types.ts';
import { getTimestamp } from './lib/timestamp.ts';
import { takeScreenshot } from './lib/screenshot.ts';
import { uploadImage } from './lib/upload-image.ts';
import { postToFarcaster } from './lib/farcaster.ts';

if (process.argv.length !== 3) {
	console.log('usage: node index.js [strategyId]');
	process.exit(1);
}

const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';
const strategyId = process.argv[2];
const timestamp = getTimestamp();

const performanceTrigger = await checkPerformance(baseUrl, strategyId);

if (!performanceTrigger) {
	console.log('No social media post triggered');
	process.exit(0);
}

console.log('Social media post triggered:');
console.log(JSON.stringify(performanceTrigger));

// request chart screenshot from frontend
const screenshot = await takeScreenshot(`${baseUrl}/strategies/${strategyId}`, '.chart-container');

// upload screenshot to image hosting service
const { url } = await uploadImage(`${strategyId}_${timestamp}.png`, screenshot);

// compose Farcaster post text
const pctString = performanceTrigger.performance.toLocaleString('en-US', {
	style: 'percent',
	minimumFractionDigits: 1
});
const text = `Strategy ${strategyId} is up ${pctString} in the past ${performanceTrigger.interval}`;

// submit the Farcaster post (with text and image)
const cast = await postToFarcaster({ text, embeds: [{ url }] });

console.log(cast);

async function checkPerformance(baseUrl: string, strategyId: string) {
	const resp = await fetch(`${baseUrl}/strategies/${strategyId}/period-performance`);
	const summaries = (await resp.json()) as PerformanceSummary[];

	// sort by performance, best performing first
	summaries.sort((a, b) => b.performance - a.performance);

	// get the best performing timeframe; return it if over threshold
	const bestTimeframe = summaries[0];
	return bestTimeframe.performance > 0.05 ? bestTimeframe : undefined;
}
