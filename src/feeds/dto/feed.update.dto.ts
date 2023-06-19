import {
	IsString,
	IsOptional,
	IsNumber,
	Min,
	Max,
	IsArray,
	IsNotEmpty,
	IsMongoId,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class FeedUpdateDto {
	@IsOptional()
	@IsString()
	@ApiProperty({
		example: '홍대 팝업스토어 같이 가실 분?',
		description: '게시글 제목',
	})
	title?: string;

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: '6월 16일 같이 가실 분 구합니다!',
		description: '게시글 내용',
	})
	content?: string;

	@IsOptional()
	@IsArray()
	@ApiProperty({
		example: '[1.png, 2.png]',
		description: '게시글 이미지',
	})
	images?: string[];

	@IsOptional()
	@IsString()
	@ApiProperty({
		example: 'qwerra21341',
		description: '게시글에서 설정한 스토어 ID',
	})
	store_id?: string;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(5)
	@ApiProperty({
		example: '3.5',
		description: '게시글 평점',
	})
	ratings?: number;

	@IsOptional()
	@IsMongoId()
	@ApiProperty({
		example: '6479cd31b0b0d8f69ffcfc55',
		description: '게시글 좋아요 누른 유저 ID',
	})
	like: Types.ObjectId;

	@IsOptional()
	@IsMongoId()
	@ApiProperty({
		example: '6479cd31b0b0d8f69ffcfc55',
		description: '게시글 신고 누른 유저 ID',
	})
	report: Types.ObjectId;

	@IsOptional()
	@IsMongoId()
	@ApiProperty({
		example: '647d4230f130cbfd139325a1',
		description: '댓글 ID',
	})
	comment: Types.ObjectId;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@ApiProperty({
		example: '0',
		description: '게시글 조회수',
		default: 0,
	})
	views: number;
}
