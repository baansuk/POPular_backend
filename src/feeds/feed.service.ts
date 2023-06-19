import {
	Injectable,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
	forwardRef,
	Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	Model,
	Types,
	AggregatePaginateModel,
	AggregatePaginateResult,
} from 'mongoose';
import { Feed } from './feed.schema';
import { FeedCreateDto } from './dto/feed.create.dto';
import { FeedUpdateDto } from './dto/feed.update.dto';
import { extractImages } from 'src/utils/extract.images.util';
import { handleImages } from 'src/utils/handle.images.util';
import { CommentsService } from 'src/comments/comment.service';

@Injectable()
export class FeedsService {
	constructor(
		@InjectModel(Feed.name)
		private readonly feedModel: AggregatePaginateModel<Feed>,
		@Inject(forwardRef(() => CommentsService))
		private commentsService: CommentsService,
	) {}

	async getAllFeeds(): Promise<Feed[]> {
		try {
			const feeds = await this.feedModel
				.find()
				.populate('author')
				.populate('store_id')
				.sort({ createdAt: -1 })
				.exec();
			return feeds;
		} catch (err) {
			throw new InternalServerErrorException(
				'글 목록 불러오기를 실패했습니다.',
			);
		}
	}

	async getFeedsByBoard(board?: string, store_id?: string): Promise<Feed[]> {
		try {
			let query: any;
			if (store_id) {
				query = this.feedModel.find({ store_id: store_id });
			} else {
				query = this.feedModel.find();
			}

			if (board) {
				query = query.where('board', board);
			}

			const feeds = await query
				.populate('author')
				.populate('store_id')
				.sort({ createdAt: -1 })
				.exec();

			return feeds;
		} catch (err) {
			throw new InternalServerErrorException(
				'글 목록 불러오기를 실패했습니다.',
			);
		}
	}

	async getAllGatherFeeds(): Promise<Feed[]> {
		return await this.getFeedsByBoard('gather');
	}

	async getAllReviewFeeds(store_id?: string): Promise<Feed[]> {
		return await this.getFeedsByBoard('review', store_id);
	}

	async getAllFreeFeeds(): Promise<Feed[]> {
		return await this.getFeedsByBoard('free');
	}

	async getFeedsByStore(id: string): Promise<Feed[]> {
		return await this.feedModel.find({ store_id: id });
	}

	async getPaginateByUserId(
		id: string,
		pageIndex: number,
		order?: string,
	): Promise<AggregatePaginateResult<Feed>> {
		let sort: { [key: string]: number } = { createdAt: -1 };

		if (order === 'desc') {
			sort = { createdAt: -1 };
		} else if (order === 'asc') {
			sort = { createdAt: 1 };
		}

		const aggregateQuery = this.feedModel.aggregate([
			{
				$match: { author: id },
			},
		]);

		const options = {
			sort,
			page: pageIndex,
			limit: 5,
		};
		return this.feedModel.aggregatePaginate<Feed>(aggregateQuery, options);
	}

	async getFeedById(id: string): Promise<Feed> {
		try {
			const feed = await this.feedModel
				.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
				.populate('author')
				.populate('store_id')
				.populate({
					path: 'comments',
					populate: [
						{
							path: 'recomments',
							model: 'Comment',
							populate: {
								path: 'author',
								model: 'User',
							},
						},
						{
							path: 'author',
							model: 'User',
						},
					],
				})
				.exec();

			if (!feed) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 글을 찾지 못했습니다.`,
				);
			}

			return feed;
		} catch (err) {
			throw new BadRequestException(
				`'${id}' 아이디를 가진 글을 불러오지 못했습니다.`,
			);
		}
	}

	async getFeedInfoById(id: string): Promise<Feed> {
		try {
			const feed = await this.feedModel.findById(id).exec();

			if (!feed) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 글을 찾지 못했습니다.`,
				);
			}

			return feed;
		} catch (err) {
			throw new BadRequestException(
				`'${id}' 아이디를 가진 글을 불러오지 못했습니다.`,
			);
		}
	}

	async getCommentsByFeedId(id: string): Promise<Object[]> {
		try {
			const feed = await this.feedModel
				.findById(id)
				.populate({
					path: 'comments',
					populate: [
						{
							path: 'recomments',
							model: 'Comment',
							populate: {
								path: 'author',
								model: 'User',
							},
						},
						{
							path: 'author',
							model: 'User',
						},
					],
				})
				.exec();

			if (!feed) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 글을 찾지 못했습니다.`,
				);
			}

			return feed.comments;
		} catch (err) {
			throw new BadRequestException(
				`'${id}' 아이디를 가진 글을 불러오지 못했습니다.`,
			);
		}
	}

	async createFeed(feedCreateDto: FeedCreateDto): Promise<Feed> {
		try {
			const base64Images = extractImages(feedCreateDto.content);
			const imageMapping = await handleImages(base64Images);
			let updatedContent = feedCreateDto.content;
			for (const [imgData, imageUrl] of Object.entries(imageMapping)) {
				updatedContent = updatedContent.replace(imgData, imageUrl);
			}

			const createdFeed = new this.feedModel();
			createdFeed.title = feedCreateDto.title;
			createdFeed.author = feedCreateDto.author;
			createdFeed.board = feedCreateDto.board;
			createdFeed.content = updatedContent;
			createdFeed.images = Object.values(imageMapping);
			createdFeed.store_id = feedCreateDto.store_id;
			createdFeed.ratings = feedCreateDto.ratings;
			createdFeed.likes = [];
			createdFeed.reports = [];
			createdFeed.comments = [];
			createdFeed.views = 0;

			return await createdFeed.save();
		} catch (err) {
			if (err.name === 'ValidationError') {
				console.log(err);
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}
			console.error(err);
			throw new InternalServerErrorException('글 생성에 실패하였습니다.');
		}
	}

	async updateFeed(id: string, feedUpdateDto: FeedUpdateDto): Promise<Feed> {
		try {
			const feed = await this.feedModel.findById(id).exec();

			if (!feed) {
				throw new NotFoundException(
					`'${id}' 아이디를 가진 글을 찾지 못했습니다.`,
				);
			}

			if (feedUpdateDto.content) {
				//이미지 추출용 이미지 변수
				const originalImages = extractImages(feedUpdateDto.content);

				//내용 추출용 이미지 변수
				const exceptImages = await handleImages(originalImages);

				//기존 이미지 배열
				const httpImages = originalImages.filter(image =>
					image.startsWith('http://'),
				);

				//추가 이미지 배열
				const base64Images = originalImages.filter(image =>
					image.startsWith('data:image/'),
				);
				const imageMapping = await handleImages(base64Images);
				const transformImages = Object.values(imageMapping);

				//DB 저장용 이미지 경로 배열
				const imageUrls = [...httpImages, ...transformImages];

				let updatedContent = feedUpdateDto.content;
				for (const [imgData, imageUrl] of Object.entries(exceptImages)) {
					updatedContent = updatedContent.replace(imgData, imageUrl);
				}

				feedUpdateDto.content = updatedContent;
				feed.images = imageUrls;
			}

			Object.assign(feed, feedUpdateDto);

			return await feed.save();
		} catch (err) {
			if (err.name === 'ValidationError') {
				throw new BadRequestException('잘못된 데이터를 입력하셨습니다.');
			}
			throw new InternalServerErrorException('글 업데이트에 실패하였습니다.');
		}
	}

	async addLike(feedId: Types.ObjectId, like: Types.ObjectId): Promise<Feed> {
		const likeObjectId = new Types.ObjectId(like);
		const likeFeed = await this.feedModel.findById(feedId);
		console.log('피드:' + likeFeed);
		const liked = likeFeed.likes.find(e => e.equals(likeObjectId));
		console.log('좋아요:' + liked);
		if (liked) {
			return this.feedModel
				.findByIdAndUpdate(
					feedId,
					{ $pull: { likes: likeObjectId } },
					{ new: true },
				)
				.exec();
		}
		return this.feedModel
			.findByIdAndUpdate(
				feedId,
				{ $addToSet: { likes: likeObjectId } },
				{ new: true },
			)
			.exec();
	}

	async addReport(
		feedId: Types.ObjectId,
		report: Types.ObjectId,
	): Promise<Feed> {
		const reportObjectId = new Types.ObjectId(report);
		const reportFeed = await this.feedModel.findById(feedId);
		const reported = reportFeed.reports.find(e => e.equals(reportObjectId));
		if (reported) {
			return this.feedModel
				.findByIdAndUpdate(
					feedId,
					{ $pull: { reports: reportObjectId } },
					{ new: true },
				)
				.exec();
		}
		return this.feedModel
			.findByIdAndUpdate(
				feedId,
				{ $addToSet: { reports: reportObjectId } },
				{ new: true },
			)
			.exec();
	}

	async addComment(
		feedId: Types.ObjectId,
		comment: Types.ObjectId,
	): Promise<Feed> {
		return this.feedModel
			.findByIdAndUpdate(
				feedId,
				{ $push: { comments: comment } },
				{ new: true },
			)
			.exec();
	}

	async removeComment(
		feedId: Types.ObjectId,
		comment: Types.ObjectId,
	): Promise<Feed> {
		return this.feedModel
			.findByIdAndUpdate(
				feedId,
				{ $pull: { comments: comment } },
				{ new: true },
			)
			.exec();
	}

	async deleteFeed(ids: string[]): Promise<void> {
		try {
			const feeds: Feed[] = await this.feedModel.find({ _id: { $in: ids } });
			if (feeds.length > 0) {
				let commentsToDelete: string[] = [];
				feeds.forEach((feed: Feed) => {
					feed.comments.forEach(comment => {
						commentsToDelete.push(comment.toString());
					});
					this.commentsService.deleteComment(commentsToDelete);
				});
			}
			const deleteResult = await this.feedModel
				.deleteMany({ _id: { $in: ids } })
				.exec();
			if (deleteResult.deletedCount === 0) {
				throw new NotFoundException(
					`해당 아이디를 가진 글들을 찾지 못했습니다.`,
				);
			}
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException('글 삭제에 실패하였습니다.');
		}
	}
}
