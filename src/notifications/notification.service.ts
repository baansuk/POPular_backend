import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationUpdateDto } from './dto/notification.update.dto';
import { Notification } from 'src/notifications/notification.schema';
import { NotificationCreateDto } from './dto/notification.create.dto';
import { User } from 'src/users/user.schema';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		@InjectModel(User.name)
		private readonly userModel: Model<User>,
	) {}

	async getNotifications(userId?: string): Promise<Notification[]> {
		try {
			let query = this.notificationModel.find();

			if (userId) {
				query = query.where('user_id', userId);
			}

			const notifications = await query
				.populate('content_store')
				.populate({
					path: 'content_comment',
					populate: [
						{
							path: 'author',
							model: 'User',
						},
					],
				})
				.populate('content_user')
				.exec();

			return notifications;
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException('알림 불러오기를 실패했습니다.');
		}
	}

	async getNotificationById(id: string): Promise<Notification> {
		try {
			const notification = await this.notificationModel
				.findById(id)
				.populate('content_store')
				.populate({
					path: 'content_comment',
					populate: [
						{
							path: 'author',
							model: 'User',
						},
					],
				})
				.populate('content_user')
				.exec();

			if (!notification) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 알림을 찾지 못했습니다.`,
				);
			}

			return notification;
		} catch (err) {
			throw new NotFoundException(
				`'${id}' 아이디를 가진 알림을 찾지 못했습니다.`,
			);
		}
	}

	async createNotification(
		notificationCreateDto: NotificationCreateDto,
	): Promise<Notification> {
		try {
			const createdNotification = new this.notificationModel();
			createdNotification.type = notificationCreateDto.type;
			createdNotification.board = notificationCreateDto.board;
			createdNotification.user_id = notificationCreateDto.user_id;
			createdNotification.content_comment =
				notificationCreateDto.content_comment;
			createdNotification.content_user = notificationCreateDto.content_user;
			createdNotification.content_store = notificationCreateDto.content_store;

			return await createdNotification.save();
		} catch (err) {
			if (err.name === 'ValidationError') {
				console.log(err);
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}
			console.error(err);
			throw new InternalServerErrorException('알림 생성에 실패하였습니다.');
		}
	}

	async createNotificationsForAll(
		notificationCreateDto: NotificationCreateDto,
	): Promise<Notification[]> {
		try {
			const targetUsers = await this.userModel.find().exec();
			const notificationPromises = targetUsers.map(async user => {
				if (user.allow_notification === false) {
				} else {
					const notificationDto = {
						...notificationCreateDto,
						user_id: user._id.toString(),
					};
					return this.createNotification(notificationDto);
				}
			});
			const createdNotifications = await Promise.all(notificationPromises);
			return createdNotifications;
		} catch (err) {
			if (err.name === 'ValidationError') {
				console.log(err);
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}
			console.error(err);
			throw new InternalServerErrorException('알림 생성에 실패하였습니다.');
		}
	}

	async updateNotification(
		id: string,
		notificationUpdateDto: NotificationUpdateDto,
	): Promise<Notification> {
		try {
			const notification = await this.notificationModel.findById(id).exec();

			if (!notification) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 알림을 찾지 못했습니다.`,
				);
			}

			Object.assign(notification, notificationUpdateDto);

			return await notification.save();
		} catch (err) {
			if (err.name === 'ValidationError') {
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}

			throw new InternalServerErrorException('알림 업데이트에 실패하였습니다.');
		}
	}

	async deleteNotification(id: string): Promise<void> {
		try {
			const deletedNotification = await this.notificationModel
				.findByIdAndRemove(id)
				.exec();

			if (!deletedNotification) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 알림을 찾지 못했습니다.`,
				);
			}
		} catch (err) {
			throw new InternalServerErrorException('알림 삭제에 실패하였습니다.');
		}
	}

	async deleteNotifications(ids: string[]): Promise<void> {
		try {
			const notifications: Notification[] = await this.notificationModel.find({
				_id: { $in: ids },
			});

			if (notifications.length > 0) {
				let notificationsToDelete: string[] = [];
				notifications.forEach(notification => {
					notificationsToDelete.push(notification.toString());
				});
			}
			const deleteResult = await this.notificationModel
				.deleteMany({ _id: { $in: ids } })
				.exec();
			if (deleteResult.deletedCount === 0) {
				throw new NotFoundException(
					`해당 아이디를 가진 알림들을 찾지 못했습니다.`,
				);
			}
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException('알림 삭제에 실패하였습니다.');
		}
	}
}
