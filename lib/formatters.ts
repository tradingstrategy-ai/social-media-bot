/**
 * Format a decimal representation as a percent – e.g., 0.02 -> 2.0%
 *
 * @param number number to be formateed
 * @param minDigits min fractional digits to display (defaults to 1)
 * @param maxDigits max fractional digits to display (defaults to min value)
 */
export function formatPercent(number: number, minDigits = 1, maxDigits = minDigits) {
	return number.toLocaleString('en-US', {
		style: 'percent',
		minimumFractionDigits: minDigits,
		maximumFractionDigits: maxDigits
	});
}
