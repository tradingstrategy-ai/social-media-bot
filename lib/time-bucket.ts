const timeBucketLabels = {
	'1h': '1 hour',
	'4h': '4 hours',
	'1d': '1 day',
	'7d': '7 days',
	'30d': '30 days'
} as const;

export type TimeBucket = keyof typeof timeBucketLabels;

/**
 * Convert a TimeBucket to a human readable label.
 */
export function getTimeBucketLabel(timeBucket: TimeBucket) {
	return timeBucketLabels[timeBucket];
}
