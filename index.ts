import 'dotenv/config';
import type { StrategyTrigger } from './lib/types.ts';
import { log } from './lib/logger.ts';
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
	log(strategyId, trigger);
	process.exit(0);
}

// render the social media post
const content = await render(strategyId, trigger as StrategyTrigger);

// if "render" command, log and exit
if (command === 'render') {
	log(strategyId, trigger, content);
	process.exit(0);
}

// submit the Farcaster post (text and image)
const post = await postToFarcaster({
	text: content.text,
	embeds: [{ url: content.imageUrl }]
});

// log and exit
log(strategyId, trigger, content, [post]);

/***************************************
 * Helper functions
 **************************************/

function parseArgs(): [string, string] {
	const args = process.argv.slice(2);

	if (args.length !== 2) {
		console.error('Usage: node index.js <strategyId> <command>');
		process.exit(1);
	}

	const [strategyId, command] = args;

	if (!['check', 'render', 'post'].includes(command)) {
		console.error('Error: command should be one of `${commands.join(', ')}`');
		process.exit(1);
	}

	return [strategyId, command];
}
