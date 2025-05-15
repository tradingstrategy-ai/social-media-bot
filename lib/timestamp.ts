export function getTimestamp() {
  return new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/T/, '_')
    .replace(/:/g, '-');
}
