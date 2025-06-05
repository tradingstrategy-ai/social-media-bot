// See https://docs.neynar.com/reference/publish-cast
import { createPlatformResult } from './logger.ts';

const apiUrl = 'https://api.neynar.com/v2/farcaster';

const signer_uuid = process.env.NEYNAR_SIGNER_UUID;

const headers = {
	'x-api-key': process.env.NEYNAR_API_KEY,
	'Content-Type': 'application/json'
};

export interface CastParams {
	text: string;
	embeds?: { url: string }[];
}

export interface CastResponse {
	success: boolean;
	cast: {
		hash: `0x${string}`;
	};
}

export async function postToFarcaster(params: CastParams) {
	const response = await fetch(`${apiUrl}/cast`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ signer_uuid, ...params })
	});

	const { success, cast }: CastResponse = await response.json();

	return createPlatformResult('farcaster', success, cast.hash);
}
