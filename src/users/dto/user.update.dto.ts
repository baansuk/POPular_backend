import { IsString, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateDto {
	@IsString()
	@IsOptional()
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: '이미지 파일',
	})
	profile?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '스포츠와 커피를 좋아하는 엘리스입니다.',
		description: '유저 한 줄 소개',
	})
	introduce?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '귀여운 토끼',
		description: '유저 닉네임',
	})
	nickname?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'qwer1234',
		description: '유저 비밀번호',
	})
	pw?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '010-1234-4321',
		description: '유저 전화번호',
	})
	phone_number?: string;

	@IsArray()
	@IsOptional()
	@ApiProperty({
		example: '[의류, 식품]',
		description: '유저 선호 카테고리 목록',
	})
	interested_category?: string[];

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		example: 'true',
		description: '유저 알림 허용 여부',
	})
	allow_notification?: boolean;
}
