import ImageKit from 'imagekit';

const imageKit = new ImageKit({
	publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
	urlEndpoint: process.env.IMAGEKIT_URL
});

export async function uploadImage(fileName: string, imageData: Uint8Array) {
	return imageKit.upload({
		fileName,
		file: Buffer.from(imageData)
	});
}
