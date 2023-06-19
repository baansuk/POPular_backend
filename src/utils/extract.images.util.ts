import * as cheerio from 'cheerio';

export function extractImages(content: string): string[] {
	const $ = cheerio.load(content);
	const images: string[] = [];

	$('img').each((index, element) => {
		const src = $(element).attr('src');
		if (src && src.startsWith('http://')) {
			images.push(src);
		}
		if (src && src.startsWith('data:image/')) {
			images.push(src);
		}
	});

	return images;
}
