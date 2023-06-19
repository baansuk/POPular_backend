import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { UserLoginDto } from './user.login.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignupDto extends UserLoginDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: '엘리스',
		description: '유저 이름',
		required: true,
	})
	name: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: '귀여운 토끼',
		description: '유저 닉네임',
		required: true,
	})
	nickname: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: '010-1234-4321',
		description: '유저 전화번호',
		required: true,
	})
	phone_number: string;

	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty({
		example: 'true',
		description: '유저 알림 여부',
		required: true,
	})
	allow_notification: boolean;
}
