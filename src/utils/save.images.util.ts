import { promises as fsPromises } from 'fs';
import { join } from 'path';

export async function saveImage(
	base64String: string,
	targetPath: string,
): Promise<void> {
	const match = base64String.match(/data:(.*);base64,(.*)/);
	if (!match) {
		throw new Error('업로드가 불가능한 이미지 확장자입니다.');
	}

	const imageData = match[2];
	const buffer = Buffer.from(imageData, 'base64');

	const directoryPath = join(targetPath, '..');

	await fsPromises.mkdir(directoryPath, { recursive: true });
	await fsPromises.writeFile(targetPath, buffer);
}
