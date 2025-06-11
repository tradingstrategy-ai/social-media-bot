/**
 * Parse command line arguments for the social media bot.
 * 
 * @returns [strategyId, command] tuple
 * @throws Exits process with error code 1 if arguments are invalid
 */
export function parseArgs(): [string, string] {
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