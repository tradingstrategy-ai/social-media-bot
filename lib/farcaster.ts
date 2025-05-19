const baseUrl = 'https://api.neynar.com/v2/farcaster';

const signer_uuid = process.env.NEYNAR_SIGNER_UUID;

const headers = {
	'x-api-key': process.env.NEYNAR_API_KEY,
	'Content-Type': 'application/json'
};

export interface CastParams {
	text: string;
	embeds?: { url: string }[];
}

export async function postToFarcaster(params: CastParams) {
	const response = await fetch(`${baseUrl}/cast`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ signer_uuid, ...params })
	});

	return response.json();
}
