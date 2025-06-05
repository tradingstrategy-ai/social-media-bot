import 'dotenv/config';
import './lib/backtest.ts';
import type { StrategyTrigger } from './lib/types.ts';
import { logger } from './lib/logger-instance.ts';
import { checkStrategyTriggers } from './lib/strategy-triggers.ts';
import { render } from './lib/templates.ts';
import { postToFarcaster } from './lib/farcaster.ts';

/***************************************
 * Main script
 **************************************/

const [strategyId, command] = parseArgs();

// check for any social media triggers
const trigger = await checkStrategyTriggers(strategyId);

// if "check" command or null trigger, log and exit
if (command === 'check' || trigger.type === null) {
	logger.log(trigger);
	process.exit(0);
}

// render the social media post
const content = await render(strategyId, trigger as StrategyTrigger);

// if "render" command, log and exit
if (command === 'render') {
	logger.log(trigger, content);
	process.exit(0);
}

// submit the Farcaster post (text and image)
const post = await postToFarcaster({
	text: content.text,
	embeds: [{ url: content.imageUrl }]
});

// log and exit
logger.log(trigger, content, [post]);

/***************************************
 * Helper functions
 **************************************/

function parseArgs(): [string, string] {
	const args = process.argv.slice(2);

	if (args.length < 2 || args.length > 4) {
		console.error('Usage: node index.js <strategyId> <command> [--logfile <path>]');
		process.exit(1);
	}

	const [strategyId, command] = args;

	if (!['check', 'render', 'post'].includes(command)) {
		console.error('Error: command should be one of `check, render, post`');
		process.exit(1);
	}

	// Validate --logfile format if provided
	if (args.length === 4 && args[2] !== '--logfile') {
		console.error('Usage: node index.js <strategyId> <command> [--logfile <path>]');
		process.exit(1);
	} else if (args.length === 3) {
		console.error('Usage: node index.js <strategyId> <command> [--logfile <path>]');
		process.exit(1);
	}

	return [strategyId, command];
}
