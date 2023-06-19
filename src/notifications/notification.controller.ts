import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { NotificationCreateDto } from './dto/notification.create.dto';
import { NotificationUpdateDto } from './dto/notification.update.dto';
import {
	ApiOperation,
	ApiTags,
	ApiBearerAuth,
	ApiOkResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiParam,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiBody,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/notifications')
@ApiTags('Notification')
export class NotificationsController {
	constructor(private readonly notificationService: NotificationsService) {}

	@ApiOperation({ summary: '모든 알림 조회' })
	@ApiOkResponse({
		description: '모든 알림 조회 성공',
	})
	@Get()
	async getNotifications() {
		return await this.notificationService.getNotifications();
	}

	@ApiOperation({ summary: '유저별 알림 조회' })
	@ApiOkResponse({
		description: '유저별 알림 조회 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더에 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '조회에 실패했을 경우',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiBearerAuth('Authorization')
	@Get('/user/:userId')
	@UseGuards(AuthGuard)
	async getUserNotifications(@Param('userId') id: string) {
		return await this.notificationService.getNotifications(id);
	}

	@ApiOperation({ summary: 'ID로 알림 조회' })
	@ApiOkResponse({
		description: 'ID로 알림 조회 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더에 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 알림이 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBearerAuth('Authorization')
	@Get('/:id')
	@UseGuards(AuthGuard)
	async getNotificationsById(@Param('id') id: string) {
		return await this.notificationService.getNotificationById(id);
	}

	@ApiOperation({ summary: '알림 등록하기' })
	@ApiCreatedResponse({
		description: '알림 등록하기 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '알림 생성에 실패했을 경우',
	})
	@ApiBody({ type: NotificationCreateDto })
	@Post()
	async createNotification(@Body() createDto: NotificationCreateDto) {
		return await this.notificationService.createNotification(createDto);
	}

	@ApiOperation({ summary: '모든 유저에게 알림 등록하기' })
	@ApiCreatedResponse({
		description: '알림 등록하기 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '알림 생성에 실패했을 경우',
	})
	@ApiBody({ type: NotificationCreateDto })
	@Post('/all')
	async createNotificationsForAll(
		@Body() notificationCreateDto: NotificationCreateDto,
	) {
		const notifications =
			await this.notificationService.createNotificationsForAll(
				notificationCreateDto,
			);
		return { message: '모든 사용자에게 알림이 생성되었습니다.', notifications };
	}

	@ApiOperation({ summary: '알림 수정하기' })
	@ApiOkResponse({
		description: '알림 수정 성공',
	})
	@ApiNotFoundResponse({
		description: '해당 ID의 알림을 찾지 못한 경우',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '알림 수정에 실패했을 경우',
	})
	@Patch(':id')
	async updateNotification(
		@Param('id') id: string,
		@Body() updateDto: NotificationUpdateDto,
	) {
		return await this.notificationService.updateNotification(id, updateDto);
	}

	@ApiOperation({ summary: '알림 삭제하기' })
	@ApiOkResponse({
		description: '알림 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 알림을 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '알림 삭제에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBearerAuth('Authorization')
	@Delete(':id')
	@UseGuards(AuthGuard)
	async deleteNotification(@Param('id') id: string) {
		await this.notificationService.deleteNotification(id);
		return { message: '알림이 삭제되었습니다.' };
	}

	@ApiOperation({ summary: '알림 삭제하기' })
	@ApiOkResponse({
		description: '알림 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 알림을 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '알림 삭제에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBearerAuth('Authorization')
	@Delete()
	@UseGuards(AuthGuard)
	async deleteNotifications(@Body() ids: string[]) {
		await this.notificationService.deleteNotifications(ids);
		return { message: '알림이 삭제되었습니다.' };
	}
}
