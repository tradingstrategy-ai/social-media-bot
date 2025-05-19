import ImageKit from 'imagekit';

export async function uploadImage(fileName: string, imageData: Uint8Array) {
	const imageKit = new ImageKit({
		publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
		privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
		urlEndpoint: process.env.IMAGEKIT_URL
	});

	return imageKit.upload({
		fileName,
		file: Buffer.from(imageData)
	});
}
