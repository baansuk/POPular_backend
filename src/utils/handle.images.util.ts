import { handleImage } from './handle.image.util';

export async function handleImages(
	base64Images: string[],
): Promise<{ [key: string]: string }> {
	const imageMapping: { [key: string]: string } = {};

	for (let imgData of base64Images) {
		const targetDir = '/uploads';
		const imagePublicUrlBase = 'http://34.22.81.36:3000';
		const imageUrl = await handleImage(imgData, targetDir, imagePublicUrlBase);

		imageMapping[imgData] = imageUrl;
	}

	return imageMapping;
}
