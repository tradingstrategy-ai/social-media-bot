import 'dotenv/config';
import type { StrategyTrigger } from './lib/types.ts';
import { isBacktest, logBacktest } from './lib/backtest.ts';
import { checkStrategyTriggers } from './lib/strategy-triggers.ts';
import { render } from './lib/templates.ts';
import { postToFarcaster } from './lib/farcaster.ts';

// check command line arg length
if (process.argv.length !== 3) {
	console.log('usage: node index.js [strategyId]');
	process.exit(1);
}

// define strategyId from command arg
const strategyId = process.argv[2];

// check for any social media triggers and abort if none
const trigger = await checkStrategyTriggers(strategyId);

// if this is a backtest, log trigger and exit
if (isBacktest) {
	logBacktest(trigger);
	process.exit(0);
}

// if no trigger, log and exit
if (trigger.trigger === null) {
	console.log('No matching strategy trigger');
	process.exit(0);
}

// render the social media post
const post = await render(strategyId, trigger as StrategyTrigger);

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
