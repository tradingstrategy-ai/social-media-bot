import 'dotenv/config';
import { checkStrategyTriggers } from './lib/strategy-triggers.ts';
import { render } from './lib/templates.ts';
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

const post = await render(baseUrl, strategyId, trigger);

// log rendered text and exit early for now
console.log(post);
process.exit(0);

// submit the Farcaster post (text and image)
const cast = await postToFarcaster({
	text: post.text,
	embeds: [{ url: post.imageUrl }]
});

// output details of successful cast
console.log(cast);
