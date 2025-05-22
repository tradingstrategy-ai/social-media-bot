export function getTimestamp() {
	return new Date().toISOString().slice(0, 16).replace(/T/, '_').replace(/:/g, '-');
}

export function dateToUnixTs(date: Date) {
	return date.valueOf() / 1000;
}

export function unixTsToDate(ts: number) {
	return new Date(ts * 1000);
}

export function addUTCHours(d0: Date, hours: number) {
	const d1 = new Date(d0);
	d1.setUTCHours(d1.getUTCHours() + hours);
	return d1;
}
