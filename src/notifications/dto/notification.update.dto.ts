import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationUpdateDto {
	@IsBoolean()
	@IsNotEmpty()
	@ApiProperty({
		example: 'true',
		description: '알림 확인 여부(true: 안 읽음, false: 읽음)',
		required: true,
	})
	checked: boolean;
}
