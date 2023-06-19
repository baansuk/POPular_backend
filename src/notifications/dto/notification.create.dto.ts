import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	ValidateIf,
} from 'class-validator';
import { NotificationType } from '../notification.schema';
import { BoardType } from 'src/feeds/feed.schema';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/user.schema';

export class NotificationCreateDto {
	@IsEnum(NotificationType)
	@IsNotEmpty()
	@ApiProperty({
		example: 'follow',
		description: '알림 종류',
		required: true,
	})
	readonly type: NotificationType;

	@IsEnum(BoardType)
	@ValidateIf(
		obj =>
			obj.type === NotificationType.COMMENT ||
			obj.type === NotificationType.RECOMMENT,
	)
	@ApiProperty({
		example: 'gather',
		description: '알림이 온 게시판 종류',
	})
	readonly board: BoardType;

	@IsMongoId()
	@ApiProperty({
		example: 'qwer2134',
		description: '알림 대상 ID',
	})
	@ValidateIf(
		obj =>
			obj.type === NotificationType.COMMENT ||
			obj.type === NotificationType.RECOMMENT ||
			obj.type === NotificationType.FOLLOW,
	)
	readonly user_id?: Types.ObjectId | User;

	@IsMongoId()
	@ApiProperty({
		example: 'qwer2134',
		description: '알림에서 참조할 데이터 ID(AD 타입 - store)',
		required: true,
	})
	@ValidateIf(obj => obj.type === NotificationType.AD)
	content_store: Types.ObjectId;

	@IsMongoId()
	@ApiProperty({
		example: 'qwer2134',
		description: '알림에서 참조할 데이터 ID(Follow 타입 - user)',
		required: true,
	})
	@ValidateIf(obj => obj.type === NotificationType.FOLLOW)
	content_user: Types.ObjectId;

	@IsMongoId()
	@ApiProperty({
		example: 'qwer2134',
		description: '알림에서 참조할 데이터 ID(Comment, Recomment 타입 - comment)',
		required: true,
	})
	@ValidateIf(
		obj =>
			obj.type === NotificationType.COMMENT ||
			obj.type === NotificationType.RECOMMENT,
	)
	content_comment: Types.ObjectId;
}
