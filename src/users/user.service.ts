import {
	BadRequestException,
	Injectable,
	Inject,
	forwardRef,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { Store } from 'src/stores/store.schema';
import { Feed } from 'src/feeds/feed.schema';
import { UserSignupDto } from './dto/user.signup.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { hashPassword } from '../utils/hassing.util';
import { handleImage } from 'src/utils/handle.image.util';
import { NotificationsService } from 'src/notifications/notification.service';
import {
	Notification,
	NotificationType,
} from 'src/notifications/notification.schema';
import { CommentsService } from 'src/comments/comment.service';
import { Comment } from 'src/comments/comment.schema';
import { FeedsService } from 'src/feeds/feed.service';

@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Store.name) private readonly storeModel: Model<Store>,
		@InjectModel(Feed.name) private readonly feedModel: Model<Feed>,
		@InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<Notification>,
		@Inject(forwardRef(() => CommentsService))
		private CommentsService: CommentsService,
		@Inject(forwardRef(() => NotificationsService))
		private NotificationsService: NotificationsService,
		@Inject(forwardRef(() => FeedsService))
		private FeedsService: FeedsService,
	) {}

	async getAllUsers(): Promise<User[]> {
		return await this.userModel.find();
	}

	async getUserByEmail(email: string): Promise<User> {
		return await this.userModel.findOne({ email });
	}

	async getUserById(_id: string): Promise<User> {
		return await this.userModel.findById({ _id });
	}

	async getScrapsById(_id: string): Promise<Types.ObjectId[]> {
		const user = await this.userModel.findById(_id).select('scraps');

		if (!user) {
			throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
		}

		return user?.scraps;
	}

	async checkDuplicateNickname(nickname: string): Promise<string> {
		const existingUser = await this.userModel.findOne({ nickname });
		return JSON.stringify({ isExists: !!existingUser });
	}

	async checkDuplicateEmail(email: string): Promise<string> {
		const existingUser = await this.userModel.findOne({ email });
		return JSON.stringify({ isExists: !!existingUser });
	}

	async createUser(body: UserSignupDto): Promise<User> {
		const pw = body.pw;
		const hashedPassword = await hashPassword(pw);

		const newUser = {
			...body,
			pw: hashedPassword,
		};

		return await this.userModel.create(newUser);
	}

	async updateUser(_id: string, body: UserUpdateDto): Promise<User> {
		const user = await this.userModel.findById(_id);

		if (!user) {
			throw new NotFoundException('사용자를 찾을 수 없습니다!');
		}

		if (body.profile) {
			const base64Image = body.profile;
			const imageUrl = await handleImage(
				base64Image,
				'/uploads',
				'http://34.22.81.36:3000',
			);

			user.profile = imageUrl;
		}

		if (body.pw) {
			const newPw = await hashPassword(body.pw);
			user.pw = newPw;
		}

		if (body.introduce) {
			user.introduce = body.introduce;
		}

		if (body.nickname) {
			user.nickname = body.nickname;
		}

		if (body.phone_number) {
			user.phone_number = body.phone_number;
		}

		if (body.interested_category) {
			user.interested_category = body.interested_category;
		}

		if (body.allow_notification !== undefined) {
			user.allow_notification = body.allow_notification;
			if (body.allow_notification === false) {
				const notifications = (
					await this.notificationModel.find({ user_id: user._id })
				).map(notification => notification._id.toString());
				await this.NotificationsService.deleteNotifications(notifications);
			}
		}

		return user.save();
	}

	async updateScrap(userId: string, storeId: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		const store = await this.storeModel.findById(storeId);

		const storeObjId = new Types.ObjectId(storeId);
		const userObjId = new Types.ObjectId(userId);

		if (!user) {
			throw new NotFoundException('해당 유저가 없습니다.');
		}

		if (!store) {
			throw new NotFoundException('해당 스토어가 없습니다');
		}

		if (user && store) {
			if (!user.scraps.includes(storeObjId)) {
				user.scraps.push(storeObjId);
			}
			if (!store.scraps.includes(userObjId)) {
				store.scraps.push(userObjId);
			}

			user.save();
			store.save();
		} else {
			throw new BadRequestException({
				message: '유저 또는 스토어의 정보를 불러오지 못했습니다.',
			});
		}

		return user;
	}

	async updateUnscrap(userId: string, storeId: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		const store = await this.storeModel.findById(storeId);

		const storeObjId = new Types.ObjectId(storeId);
		const userObjId = new Types.ObjectId(userId);

		if (!user) {
			throw new NotFoundException('해당 유저가 없습니다.');
		}

		if (!store) {
			throw new NotFoundException('해당 스토어가 없습니다');
		}

		if (user && store) {
			const sIndex = user.scraps.indexOf(storeObjId);
			const uIndex = store.scraps.indexOf(userObjId);

			if (sIndex !== -1) {
				user.scraps.splice(sIndex, 1);
			}

			if (uIndex !== -1) {
				store.scraps.splice(uIndex, 1);
			}

			await user.save();
			await store.save();
		}

		return user;
	}

	async updateNotification(
		userId: Types.ObjectId | User,
		notification: Types.ObjectId,
	): Promise<User> {
		return this.userModel
			.findByIdAndUpdate(
				userId,
				{ $push: { notifications: notification } },
				{ new: true },
			)
			.exec();
	}

	async updateFollow(user_id: string, target_id: string): Promise<User> {
		const user = await this.userModel.findById(user_id);
		const target = await this.userModel.findById(target_id);

		if (!user) {
			throw new NotFoundException('해당 유저가 없습니다.');
		}

		if (!target) {
			throw new NotFoundException('팔로우할 유저가 없습니다');
		}

		const followingInfo = {
			_id: user._id.toString(),
			nickname: user.nickname,
			profile: user.profile,
		};

		const followerInfo = {
			_id: target._id.toString(),
			nickname: target.nickname,
			profile: target.profile,
		};

		if (user && target) {
			if (!user.following.includes(followerInfo)) {
				user.following.push(followerInfo);
			}

			if (!target.follower.includes(followingInfo)) {
				target.follower.push(followingInfo);
			}

			user.save();
			target.save();
		}

		if (target.allow_notification === false) {
		} else {
			const notificationCreatDto = {
				type: NotificationType.FOLLOW,
				board: null,
				user_id: target._id.toString(),
				content_comment: null,
				content_store: null,
				content_user: new Types.ObjectId(user._id),
			};

			const createdNotification =
				await this.NotificationsService.createNotification(
					notificationCreatDto,
				);
			await this.updateNotification(target._id, createdNotification._id);
		}

		return user;
	}

	async updateUnfollow(user_id: string, target_id: string): Promise<User> {
		const user = await this.userModel.findById(user_id);
		const target = await this.userModel.findById(target_id);

		if (!user) {
			throw new NotFoundException('해당 유저가 없습니다.');
		}

		if (!target) {
			throw new NotFoundException('팔로우할 유저가 없습니다');
		}

		if (user && target) {
			for (const item of user.following) {
				if (item._id === target_id) {
					user.following.splice(user.following.indexOf(item), 1);
				}
			}

			for (const item of target.follower) {
				if (item._id === user_id) {
					target.follower.splice(target.follower.indexOf(item), 1);
				}
			}

			user.save();
			target.save();
		}

		return user;
	}

	async deleteUser(_id: string): Promise<User> {
		const targetUser = await this.getUserById(_id);

		if (!targetUser) {
			throw new NotFoundException('해당 사용자가 없습니다.');
		}

		//삭제할 유저의 follower 목록에 있는 유저들의 following 목록에서 삭제할 유저의 ID 삭제
		await this.userModel.updateMany(
			{ follower: { $elemMatch: { _id: _id } } },
			{ $pull: { follower: { _id: _id } } },
		);

		//삭제할 유저의 following 목록에 있는 유저들의 follower 목록에서 삭제할 유저의 ID 삭제
		await this.userModel.updateMany(
			{ following: { $elemMatch: { _id: _id } } },
			{ $pull: { following: { _id: _id } } },
		);

		//user가 scrap한 스토어의 scrap 목록에서 user_id 제거
		const updateQuery = {
			$pull: { scraps: _id },
		};
		await this.storeModel.updateMany({ scraps: _id }, updateQuery);

		//user가 작성한 댓글 삭제(comment.service에서 deleteComment를 가져와서 사용해야함)
		const comments = await this.commentModel.find({ author: _id }).select(_id);

		if (comments.length > 0) {
			const commentIds = comments.map(comment => comment._id);
			await this.CommentsService.deleteComment(commentIds);
		}
		// user가 작성한 게시글 삭제(feed.service에서 deleteFeed를 가져와서 사용해야함)
		const feeds = await this.feedModel.find({ author: _id }).select(_id);

		if (feeds.length > 0) {
			const feedIds = feeds.map(feed => feed._id);
			await this.FeedsService.deleteFeed(feedIds);
		}

		// user관련 알림 삭제(notification.service에서 deleteNotification을 가져와서 사용해야함)
		const userNotifications = await this.notificationModel
			.find({ user_id: _id })
			.select(_id);
		const userRelatedNotifications = await this.notificationModel
			.find({ content_user: _id })
			.select(_id);

		const notifications = [...userNotifications, ...userRelatedNotifications];
		if (notifications.length > 0) {
			const notificationsIds = notifications.map(
				notification => notification._id,
			);
			console.log(notificationsIds);
			await this.NotificationsService.deleteNotifications(notificationsIds);
		}

		return await this.userModel.findByIdAndDelete(_id);
	}

	async deleteUsers(ids: string[]): Promise<void> {
		if (ids.length === 0) {
			throw new NotFoundException('');
		}
		for (const id of ids) {
			await this.deleteUser(id);
		}
	}
}
