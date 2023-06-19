import * as uuid from 'uuid';
import { saveImage } from './save.images.util';

export async function handleImage(
	base64String: string,
	imageFolderPath: string,
	imagePublicUrlBase: string,
): Promise<string> {
	const filename = `${uuid.v4()}.png`;
	const filePath = `${imageFolderPath}/${filename}`;
	await saveImage(base64String, `.${filePath}`);

	const imageUrl = `${imagePublicUrlBase}${filePath}`;

	return imageUrl;
}
