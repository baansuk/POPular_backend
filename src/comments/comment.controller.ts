import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comment.service';
import { CommentCreateDto } from './dto/comment.create.dto';
import { CommentUpdateDto, RecommentDto } from './dto/comment.update.dto';
import {
	ApiOperation,
	ApiTags,
	ApiBearerAuth,
	ApiOkResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiParam,
	ApiQuery,
	ApiBody,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';
import { Comment } from './comment.schema';

@Controller('/comments')
@ApiTags('Comment')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@ApiOperation({ summary: '모든 댓글 조회' })
	@ApiOkResponse({
		description: '모든 댓글 조회 성공',
	})
	@Get()
	async getAllComments() {
		return await this.commentsService.getAllComments();
	}

	@ApiOperation({ summary: 'ID로 댓글 조회' })
	@ApiOkResponse({
		description: 'ID로 댓글 조회 성공',
	})
	@ApiBadRequestResponse({
		description: 'ID가 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 댓글이 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get(':id')
	async getCommentById(@Param('id') id: string) {
		return await this.commentsService.getCommentById(id);
	}

	@ApiOperation({ summary: 'ID로 댓글 정보 조회' })
	@ApiOkResponse({
		description: 'ID로 댓글 정보 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 댓글이 없을 경우',
	})
	@ApiBadRequestResponse({
		description: 'ID가 없을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get('info/:id')
	async getCommentInfoById(@Param('id') id: string) {
		return await this.commentsService.getCommentInfoById(id);
	}

	@ApiOperation({ summary: '유저가 작성한 댓글 페이지네이션 조회' })
	@ApiOkResponse({
		description: '유저가 작성한 댓글 페이지네이션 조회 성공',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiQuery({ name: 'pageIndex', type: Number })
	@ApiQuery({ name: 'order', type: String, enum: ['desc', 'asc'] })
	@Get('user/:userId')
	async getPagination(
		@Param('userId') id: string,
		@Query('pageIndex') pageIndex: number,
		@Query('order') order?: string,
	) {
		pageIndex = pageIndex || 1;
		return await this.commentsService.getPaginationByUserId(
			id,
			pageIndex,
			order,
		);
	}

	@ApiOperation({ summary: '댓글 추가하기' })
	@ApiCreatedResponse({
		description: '댓글 생성 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '댓글 생성에 실패했을 경우',
	})
	@ApiBody({ type: CommentCreateDto })
	@ApiBearerAuth('Authorization')
	@Post()
	@UseGuards(AuthGuard)
	async createComment(@Body() createDto: CommentCreateDto) {
		return await this.commentsService.createComment(createDto);
	}

	@ApiOperation({ summary: '댓글 수정하기' })
	@ApiOkResponse({
		description: '댓글 수정 성공',
	})
	@ApiNotFoundResponse({
		description: '해당 ID의 댓글을 찾지 못한 경우',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '댓글 수정에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBody({ type: CommentUpdateDto })
	@ApiBearerAuth('Authorization')
	@Patch(':id')
	@UseGuards(AuthGuard)
	async updateComment(
		@Param('id') id: string,
		@Body() updateDto: CommentUpdateDto,
	) {
		return await this.commentsService.updateComment(id, updateDto);
	}

	@ApiOperation({ summary: '대댓글 추가' })
	@ApiOkResponse({
		description: '대댓글 추가 성공',
	})
	@ApiParam({ name: 'id', type: Types.ObjectId })
	@ApiBody({ type: RecommentDto })
	@Patch(':id/recomment')
	async addRecomment(
		@Param('id') commentId: Types.ObjectId,
		@Body() recommentDto: RecommentDto,
	): Promise<Comment> {
		return this.commentsService.addRecomment(commentId, recommentDto.recomment);
	}

	@ApiOperation({ summary: '대댓글 삭제' })
	@ApiOkResponse({
		description: '대댓글 삭제 성공',
	})
	@ApiParam({ name: 'id', type: Types.ObjectId })
	@ApiBody({ type: RecommentDto })
	@Delete(':id/recomment')
	async removeRecomment(
		@Param('id') commentId: Types.ObjectId,
		@Body() recommentDto: RecommentDto,
	): Promise<Comment> {
		return this.commentsService.removeRecomment(
			commentId,
			recommentDto.recomment,
		);
	}

	@ApiOperation({ summary: '댓글 삭제하기' })
	@ApiOkResponse({
		description: '댓글 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 게시글을 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '댓글 삭제에 실패했을 경우',
	})
	@ApiBody({ type: Array<String> })
	@ApiBearerAuth('Authorization')
	@Delete()
	@UseGuards(AuthGuard)
	async deleteComment(@Body() ids: string[]) {
		await this.commentsService.deleteComment(ids);
		return { message: '댓글이 삭제되었습니다.' };
	}
}
