import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards,
	Query,
} from '@nestjs/common';
import {
	ApiOperation,
	ApiTags,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
	ApiBody,
	ApiOkResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiInternalServerErrorResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FeedsService } from './feed.service';
import { FeedCreateDto } from './dto/feed.create.dto';
import { FeedUpdateDto } from './dto/feed.update.dto';
import { Feed } from './feed.schema';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/feeds')
@ApiTags('Feed')
export class FeedsController {
	constructor(private readonly feedsService: FeedsService) {}

	@ApiOperation({ summary: '모든 게시글 조회' })
	@ApiOkResponse({
		description: '모든 게시글 조회 성공',
	})
	@Get()
	async getAllFeeds() {
		return await this.feedsService.getAllFeeds();
	}

	@ApiOperation({ summary: '유저가 작성한 게시글 페이지네이션 조회' })
	@ApiOkResponse({
		description: '유저가 작성한 게시글 페이지네이션 조회 성공',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiQuery({ name: 'pageIndex', type: Number })
	@ApiQuery({ name: 'order', type: String, enum: ['desc', 'asc'] })
	@Get('user/:userId')
	async getPaginate(
		@Param('userId') id: string,
		@Query('pageIndex') pageIndex: number,
		@Query('order') order?: string,
	) {
		pageIndex = pageIndex || 1;
		return await this.feedsService.getPaginateByUserId(id, pageIndex, order);
	}

	@ApiOperation({ summary: '모든 모집게시판 조회' })
	@ApiOkResponse({
		description: '모든 모집게시판 조회 성공',
	})
	@Get('gather')
	async getAllGatherFeeds() {
		return await this.feedsService.getAllGatherFeeds();
	}

	@ApiOperation({ summary: '모든 후기게시판 조회' })
	@ApiOkResponse({
		description: '모든 후기게시판 조회 성공',
	})
	@Get('review')
	async getAllReviewFeeds(@Query('storeId') store_id?: string) {
		return await this.feedsService.getAllReviewFeeds(store_id);
	}

	@ApiOperation({ summary: '모든 자유게시판 조회' })
	@ApiOkResponse({
		description: '모든 자유게시판 조회 성공',
	})
	@Get('free')
	async getAllFreeFeeds() {
		return await this.feedsService.getAllFreeFeeds();
	}

	@ApiOperation({ summary: '스토어별 후기 게시판 조회' })
	@ApiOkResponse({
		description: '스토어별 후기 게시판 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 스토어가 없을 경우',
	})
	@Get('review/store/:storeId')
	async getFeedsByStore(@Param('storeId') id: string): Promise<Feed[]> {
		return await this.feedsService.getFeedsByStore(id);
	}

	@ApiOperation({ summary: 'ID로 게시글 조회' })
	@ApiOkResponse({
		description: 'ID로 게시글 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글이 없을 경우',
	})
	@ApiBadRequestResponse({
		description: 'ID가 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get(':id')
	async getFeedById(@Param('id') id: string) {
		return await this.feedsService.getFeedById(id);
	}

	@ApiOperation({ summary: 'ID로 게시글 찾기(조회수 증가나 Populate 없음)' })
	@ApiOkResponse({
		description: 'ID로 게시글 정보 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글이 없을 경우',
	})
	@ApiBadRequestResponse({
		description: 'ID가 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get('info/:id')
	async getFeedInfoById(@Param('id') id: string) {
		return await this.feedsService.getFeedInfoById(id);
	}

	@ApiOperation({ summary: '게시글 ID로 게시글의 댓글 조회' })
	@ApiOkResponse({
		description: '게시글 ID로 게시글의 댓글 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글이 없을 경우',
	})
	@ApiBadRequestResponse({
		description: 'ID가 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get(':id/comments')
	async getCommentsByFeedId(@Param('id') id: string) {
		return await this.feedsService.getCommentsByFeedId(id);
	}

	@ApiOperation({ summary: '게시글 등록하기' })
	@ApiCreatedResponse({
		description: '게시글 생성 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '게시글 생성에 실패했을 경우',
	})
	@ApiBody({ type: FeedCreateDto })
	@ApiBearerAuth('Authorization')
	@Post()
	@UseGuards(AuthGuard)
	async createFeed(@Body() createDto: FeedCreateDto): Promise<Feed> {
		return await this.feedsService.createFeed(createDto);
	}

	@ApiOperation({ summary: '게시글 수정하기' })
	@ApiOkResponse({
		description: '게시글 수정 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글을 찾지 못한 경우',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '게시글 수정에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBody({ type: FeedUpdateDto })
	@ApiBearerAuth('Authorization')
	@Patch(':id')
	@UseGuards(AuthGuard)
	async updateFeed(
		@Param('id') id: string,
		@Body() updateDto: FeedUpdateDto,
	): Promise<Feed> {
		return await this.feedsService.updateFeed(id, updateDto);
	}

	@ApiOperation({ summary: '게시글 좋아요 추가 및 삭제' })
	@ApiOkResponse({
		description: '게시글 좋아요 추가 및 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiBearerAuth('Authorization')
	@Patch(':id/like')
	@UseGuards(AuthGuard)
	async addLike(
		@Param('id') feedId: Types.ObjectId,
		@Body() updateFeedDto: FeedUpdateDto,
	): Promise<Feed> {
		const { like } = updateFeedDto;
		return this.feedsService.addLike(feedId, like);
	}

	@ApiOperation({ summary: '게시글 신고 추가 및 삭제' })
	@ApiOkResponse({
		description: '게시글 신고 추가 및 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiBearerAuth('Authorization')
	@Patch(':id/report')
	@UseGuards(AuthGuard)
	async addReport(
		@Param('id') feedId: Types.ObjectId,
		@Body() updateFeedDto: FeedUpdateDto,
	): Promise<Feed> {
		const { report } = updateFeedDto;
		return this.feedsService.addReport(feedId, report);
	}

	@ApiOperation({ summary: '게시글 댓글 추가' })
	@ApiOkResponse({
		description: '게시글 댓글 추가 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiParam({ name: 'id', type: Types.ObjectId })
	@ApiBody({ type: FeedUpdateDto })
	@ApiBearerAuth('Authorization')
	@Patch(':id/comment')
	@UseGuards(AuthGuard)
	async addComment(
		@Param('id') feedId: Types.ObjectId,
		@Body() updateFeedDto: FeedUpdateDto,
	): Promise<Feed> {
		const { comment } = updateFeedDto;
		return this.feedsService.addComment(feedId, comment);
	}

	@ApiOperation({ summary: '게시글 댓글 삭제' })
	@ApiOkResponse({
		description: '게시글 댓글 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiParam({ name: 'id', type: Types.ObjectId })
	@ApiBody({ type: FeedUpdateDto })
	@ApiBearerAuth('Authorization')
	@Delete(':id/comment')
	@UseGuards(AuthGuard)
	async removeComment(
		@Param('id') feedId: Types.ObjectId,
		@Body() updateFeedDto: FeedUpdateDto,
	): Promise<Feed> {
		const { comment } = updateFeedDto;
		return this.feedsService.removeComment(feedId, comment);
	}

	@ApiOperation({ summary: '게시글 삭제하기' })
	@ApiOkResponse({
		description: '게시글 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글을 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '게시글 삭제에 실패했을 경우',
	})
	@ApiBody({ type: Array<String> })
	@ApiBearerAuth('Authorization')
	@Delete()
	@UseGuards(AuthGuard)
	async deleteFeed(@Body() ids: string[]) {
		await this.feedsService.deleteFeed(ids);
		return { message: '글이 삭제되었습니다.' };
	}
}
