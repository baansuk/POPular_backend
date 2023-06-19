import * as bcrypt from 'bcrypt';

export async function hashPassword(pw: string): Promise<string> {
	const saltRounds = 10;
	return await bcrypt.hash(pw, saltRounds);
}

export async function comparePasswords(
	pw: string,
	hashedPw: string,
): Promise<boolean> {
	const result = await bcrypt.compare(pw, hashedPw);
	return result;
}
