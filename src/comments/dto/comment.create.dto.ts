import {
	IsString,
	IsArray,
	IsNotEmpty,
	IsMongoId,
	IsObject,
	IsEnum,
	ValidateNested,
} from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ParentType, parentinfo } from '../comment.schema';
import { Type } from 'class-transformer';

class ParentInfoDto {
	@IsEnum(ParentType)
	@IsNotEmpty()
	@ApiProperty({
		example: ParentType.FEED,
		description: '댓글의 부모 항목 유형',
		required: true,
	})
	readonly type: ParentType;

	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({
		example: '60b8db8f8b79310a980e987a',
		description: '댓글의 부모 항목 ID',
		required: true,
	})
	readonly id: Types.ObjectId;
}

export class CommentCreateDto {
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({
		example: 'qqwe2134',
		description: '댓글 작성자 ID',
		required: true,
	})
	readonly author: Types.ObjectId;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: '저요!',
		description: '댓글 내용',
		required: true,
	})
	readonly content: string;

	@ValidateNested()
	@Type(() => ParentInfoDto)
	@ApiProperty({
		example: { type: 'Feed', id: '60b8db8f8b79310a980e987a' },
		description: '댓글의 부모 항목 정보',
		required: true,
	})
	parent: ParentInfoDto;
}
