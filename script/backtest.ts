import { execSync } from 'node:child_process';
import { addUTCHours } from '../lib/date.ts';

/***************************************
 * Main script
 **************************************/

const [strategyId, start, end] = parseArgs();

console.error(
	`Starting backtest from ${start.toISOString().slice(0, 16)} to ${end.toISOString().slice(0, 16)}`
);

for (const interval of generateIntervals(start, end)) {
	try {
		execSync(`pnpm run --silent dev ${strategyId} check`, {
			env: { ...process.env, BACKTEST_TIME: interval.toISOString() }
		});
	} catch (error) {
		console.error(`Error at ${interval.toISOString()}:`, error);
	}
}

console.error('\nBacktest complete');

/***************************************
 * Helper functions
 **************************************/

function parseArgs(): [string, Date, Date] {
	const args = process.argv.slice(2);

	if (args.length !== 3) {
		console.error('Usage: node script/backtest.ts <strategyId> <start> <end>');
		console.error(
			'Example: node script/backtest.ts my-strategy "2024-01-15T14:00:00Z" "2024-01-17T14:00:00Z"'
		);
		process.exit(1);
	}

	const [strategyId, startStr, endStr] = args;
	const start = new Date(startStr);
	const end = new Date(endStr);

	if (isNaN(start.getTime()) || isNaN(end.getTime())) {
		console.error('Error: Invalid date format. Use ISO 8601 format');
		process.exit(1);
	}

	if (start >= end) {
		console.error('Error: Start time must be before end time');
		process.exit(1);
	}

	return [strategyId, start, end];
}

function* generateIntervals(start: Date, end: Date): Generator<Date> {
	let current = new Date(start);

	while (current <= end) {
		yield new Date(current);
		current = addUTCHours(current, 1);
	}
}
