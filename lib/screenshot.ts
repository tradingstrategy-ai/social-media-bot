import { firefox } from 'playwright';

export async function takeScreenshot(url: string, selector: string) {
	const browser = await firefox.launch();
	const page = await browser.newPage();

	try {
		await page.goto(url);
		const node = await page.waitForSelector(selector);

		if (node) {
			return await node.screenshot({ type: 'png' });
		} else {
			throw new Error(`Selector "${selector}" not found at ${url}`);
		}
	} finally {
		await browser.close();
	}
}
