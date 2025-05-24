import 'dotenv/config';
import { checkStrategyTriggers } from './lib/strategy-triggers.ts';
import { takeScreenshot } from './lib/screenshot.ts';
import { uploadImage } from './lib/upload-image.ts';
import { getTimestamp } from './lib/date.ts';
import { postToFarcaster } from './lib/farcaster.ts';

// check command line arg length
if (process.argv.length !== 3) {
	console.log('usage: node index.js [strategyId]');
	process.exit(1);
}

// define url and strategy constants
const baseUrl = process.env.TS_BASE_URL ?? 'http://localhost:5173';
const strategyId = process.argv[2];

// check for any social media triggers and abort if none
const trigger = await checkStrategyTriggers(baseUrl, strategyId);

if (!trigger) {
	console.log('No social media post triggered');
	process.exit(0);
}

console.log('Social media post triggered:');
console.log(JSON.stringify(trigger));

// exit early for now
process.exit(0);

// request chart screenshot from frontend
const screenshot = await takeScreenshot(`${baseUrl}/strategies/${strategyId}`, '.chart-container');

// upload screenshot to image hosting service
const { url } = await uploadImage(`${strategyId}_${getTimestamp()}.png`, screenshot);

// compose Farcaster post text
const pctString = trigger.performance.toLocaleString('en-US', {
	style: 'percent',
	minimumFractionDigits: 1
});
const text = `Strategy ${strategyId} is up ${pctString} in the past ${trigger.interval}`;

// submit the Farcaster post (text and image)
const cast = await postToFarcaster({ text, embeds: [{ url }] });

// output details of successful cast
console.log(cast);
