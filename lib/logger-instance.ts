import { Logger } from './logger.ts';

/**
 * Parse logfile argument from process.argv
 */
function parseLogFileFromArgs(): string | undefined {
	const args = process.argv.slice(2);

	// Look for --logfile flag
	const logfileIndex = args.indexOf('--logfile');
	if (logfileIndex !== -1 && logfileIndex + 1 < args.length) {
		return args[logfileIndex + 1];
	}

	return undefined;
}

// Create singleton logger instance
const logFile = parseLogFileFromArgs();
export const logger = new Logger(logFile);
