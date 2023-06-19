import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		example: 'test1@elice.com',
		description: '유저 이메일',
		required: true,
	})
	email: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: '1111',
		description: '유저 비밀번호',
		required: true,
	})
	pw: string;
}
