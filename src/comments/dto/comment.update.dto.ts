import { IsString, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class RecommentDto {
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({
		example: '60b8db8f8b79310a980e987a',
		description: '대댓글 ID',
		required: true,
	})
	readonly recomment: Types.ObjectId;
}

export class CommentUpdateDto {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '저요!',
		description: '댓글 내용',
		required: true,
	})
	readonly content: string;
}
