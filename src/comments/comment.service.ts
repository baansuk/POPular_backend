import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, ancestorinfo } from './comment.schema';
import {
	Model,
	Types,
	AggregatePaginateModel,
	AggregatePaginateResult,
} from 'mongoose';
import { CommentCreateDto } from './dto/comment.create.dto';
import { CommentUpdateDto } from './dto/comment.update.dto';
import { FeedsService } from 'src/feeds/feed.service';
import { BoardType, Feed } from 'src/feeds/feed.schema';
import { UserService } from 'src/users/user.service';
import { NotificationsService } from 'src/notifications/notification.service';
import {
	Notification,
	NotificationType,
} from 'src/notifications/notification.schema';
import { User } from 'src/users/user.schema';
import { Type } from 'class-transformer';

@Injectable()
export class CommentsService {
	constructor(
		@InjectModel(Comment.name)
		private readonly commentModel: AggregatePaginateModel<Comment>,
		@InjectModel(Notification.name)
		private readonly notificationModel: AggregatePaginateModel<Notification>,
		@InjectModel(User.name)
		private readonly userModel: AggregatePaginateModel<User>,
		@Inject(forwardRef(() => FeedsService)) private feedsService: FeedsService,
		@Inject(forwardRef(() => UserService)) private UserService: UserService,
		@Inject(forwardRef(() => NotificationsService))
		private NotificationsService: NotificationsService,
	) {}

	async getAllComments(): Promise<Comment[]> {
		try {
			const comments = await this.commentModel.find().populate('author').exec();

			return comments;
		} catch (err) {
			throw new InternalServerErrorException(
				'댓글 목록 불러오기를 실패했습니다.',
			);
		}
	}

	async getCommentById(id: string): Promise<Comment> {
		try {
			const comment = await this.commentModel
				.findById(id)
				.populate('author')
				.exec();

			if (!comment) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 댓글을 찾지 못했습니다.`,
				);
			}

			if (comment.parent.type === 'Feed') {
				await comment.populate({ path: 'parent.id', model: 'Feed' });
			} else if (comment.parent.type === 'Comment') {
				await comment.populate({ path: 'parent.id', model: 'Comment' });
			}

			return comment;
		} catch (err) {
			throw new BadRequestException(
				`'${id}' 아이디를 가진 댓글을 불러오지 못했습니다.`,
			);
		}
	}

	async getCommentInfoById(id: string): Promise<Comment> {
		try {
			const comment = await this.commentModel.findById(id).exec();

			async function generateAncestor(
				savedComment: Comment,
				feedsService: FeedsService,
				commentsService: CommentsService,
			): Promise<ancestorinfo> {
				if (savedComment.parent.type === 'Feed') {
					const thisParent = feedsService.getFeedInfoById(
						savedComment.parent.id.toString(),
					);
					const thisBoardType = (await thisParent).board;
					const thisId = new Types.ObjectId((await thisParent)._id);
					return {
						type: thisBoardType,
						id: thisId,
					};
				}
				const thisParent = commentsService.getCommentInfoById(
					savedComment.parent.id.toString(),
				);
				const thisGrandparent = feedsService.getFeedInfoById(
					(await thisParent).parent.id.toString(),
				);
				const thisBoardType = (await thisGrandparent).board;
				const thisId = new Types.ObjectId((await thisGrandparent)._id);
				return {
					type: thisBoardType,
					id: thisId,
				};
			}

			comment.ancestor = await generateAncestor(
				comment,
				this.feedsService,
				this,
			);

			if (!comment) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 댓글을 찾지 못했습니다.`,
				);
			}
			return comment;
		} catch (err) {
			throw new BadRequestException(
				`'${id}' 아이디를 가진 댓글을 불러오지 못했습니다.`,
			);
		}
	}

	async getPaginationByUserId(
		id: string,
		pageIndex: number,
		order: string,
	): Promise<AggregatePaginateResult<Comment>> {
		let sort: { [key: string]: number } = { createdAt: -1 };

		if (order === 'desc') {
			sort = { createdAt: -1 };
		} else if (order === 'asc') {
			sort = { createdAt: 1 };
		}

		const aggregateQuery = this.commentModel.aggregate([
			{
				$match: { author: id },
			},
		]);

		const options = {
			sort,
			page: pageIndex,
			limit: 5,
		};

		return this.commentModel.aggregatePaginate<Comment>(
			aggregateQuery,
			options,
		);
	}

	async createComment(commentCreateDto: CommentCreateDto): Promise<Comment> {
		try {
			const createdComment = new this.commentModel();
			createdComment.author = commentCreateDto.author;
			createdComment.content = commentCreateDto.content;
			createdComment.parent = commentCreateDto.parent;
			createdComment.recomments = [];

			const savedComment = await createdComment.save();
			const user = this.userModel.findById(savedComment.author.toString());

			async function generateAncestor(
				savedComment: Comment,
				feedsService: FeedsService,
				commentsService: CommentsService,
			): Promise<{
				type: BoardType;
				author: Types.ObjectId | User;
			}> {
				if (savedComment.parent.type === 'Feed') {
					const thisParent = feedsService.getFeedInfoById(
						savedComment.parent.id.toString(),
					);
					const thisBoardType = (await thisParent).board;
					const thisAuthor = (await thisParent).author;
					return {
						type: thisBoardType,
						author: thisAuthor,
					};
				}
				const thisParent = commentsService.getCommentInfoById(
					savedComment.parent.id.toString(),
				);
				const thisGrandparent = feedsService.getFeedInfoById(
					(await thisParent).parent.id.toString(),
				);
				const thisBoardType = (await thisGrandparent).board;
				const thisAuthor = (await thisParent).author;
				return {
					type: thisBoardType,
					author: thisAuthor,
				};
			}

			const notificationCreateDto = {
				type:
					savedComment.parent.type === 'Comment'
						? NotificationType.RECOMMENT
						: NotificationType.COMMENT,
				board: (await generateAncestor(savedComment, this.feedsService, this))
					.type,
				user_id: (await generateAncestor(savedComment, this.feedsService, this))
					.author,
				content_comment: savedComment._id,
				content_store: null,
				content_user: null,
			};

			if (
				(await generateAncestor(savedComment, this.feedsService, this))
					.author === savedComment.author ||
				(await user).allow_notification === false
			) {
			} else {
				const createdNotification =
					await this.NotificationsService.createNotification(
						notificationCreateDto,
					);
				await this.UserService.updateNotification(
					savedComment.author,
					createdNotification._id,
				);
			}

			if (savedComment.parent.type === 'Comment') {
				await this.addRecomment(savedComment.parent.id, savedComment._id);
			} else {
				await this.feedsService.addComment(
					savedComment.parent.id,
					savedComment._id,
				);
			}
			return savedComment;
		} catch (err) {
			if (err.name === 'ValidationError') {
				console.log(err);
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}
			console.log(err);
			throw new InternalServerErrorException('댓글 생성에 실패하였습니다.');
		}
	}

	async updateComment(
		id: string,
		commentUpdateDto: CommentUpdateDto,
	): Promise<Comment> {
		try {
			const updatedComment = await this.commentModel.findById(id).exec();

			if (!updatedComment) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 댓글을 찾지 못했습니다.`,
				);
			}

			Object.assign(updatedComment, commentUpdateDto);

			return await updatedComment.save();
		} catch (err) {
			if (err.name === 'ValidationError') {
				console.log(err);
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}

			throw new InternalServerErrorException('댓글 업데이트에 실패하였습니다.');
		}
	}

	async addRecomment(
		commentId: Types.ObjectId,
		recomment: Types.ObjectId,
	): Promise<Comment> {
		return this.commentModel
			.findByIdAndUpdate(
				commentId,
				{ $push: { recomments: recomment } },
				{ new: true },
			)
			.exec();
	}

	async removeRecomment(
		commentId: Types.ObjectId,
		recomment: Types.ObjectId,
	): Promise<Comment> {
		return this.commentModel
			.findByIdAndUpdate(
				commentId,
				{ $pull: { recomments: recomment } },
				{ new: true },
			)
			.exec();
	}

	async deleteComment(ids: string[]): Promise<void> {
		try {
			const comments = await this.commentModel.find({ _id: { $in: ids } });
			let recommentsToDelete: string[] = [];
			if (comments.length > 0) {
				comments.forEach(comment => {
					this.feedsService.removeComment(comment.parent.id, comment._id);
					comment.recomments.forEach(recomment => {
						recommentsToDelete.push(recomment.toString());
						this.removeRecomment(comment._id, recomment);
					});
				});
			}

			if (recommentsToDelete.length > 0) {
				await this.deleteComment(recommentsToDelete);
			}

			const notifications = await this.notificationModel.find({
				content_comment: { $in: ids },
			});
			if (notifications.length > 0) {
				const notificationsIds = notifications.map(
					notification => notification._id,
				);
				await this.NotificationsService.deleteNotifications(notificationsIds);
			}

			const deleteResult = await this.commentModel
				.deleteMany({ _id: { $in: ids } })
				.exec();
			if (deleteResult.deletedCount === 0) {
				throw new NotFoundException(
					`해당 아이디를 가진 댓글들을 찾지 못했습니다.`,
				);
			}
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException('댓글 삭제에 실패하였습니다.');
		}
	}
}
