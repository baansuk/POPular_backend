import {
	Controller,
	Get,
	Post,
	Delete,
	Param,
	Body,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UserSignupDto } from './dto/user.signup.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { UserService } from './user.service';
import { User } from './user.schema';
import {
	ApiOperation,
	ApiTags,
	ApiBearerAuth,
	ApiProperty,
	ApiOkResponse,
	ApiInternalServerErrorResponse,
	ApiParam,
	ApiCreatedResponse,
	ApiBody,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

class checknickname {
	@ApiProperty({
		example: '귀여운 토끼',
		description: '중복 체크할 닉네임',
		required: true,
	})
	nickname: string;
}

class checkemail {
	@ApiProperty({
		example: 'elice@elice.com',
		description: '중복 체크할 이메일',
		required: true,
	})
	email: string;
}

@Controller('/users')
@ApiTags('User')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: '모든 유저 정보 조회' })
	@ApiOkResponse({
		description: '모든 유저 정보 조회 성공',
	})
	@Get()
	async getAllUsers(): Promise<User[]> {
		return await this.userService.getAllUsers();
	}

	@ApiOperation({ summary: 'ID로 유저 정보 조회' })
	@ApiOkResponse({
		description: 'ID로 유저 정보 조회 성공',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID를 입력했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get(':id')
	async getUserById(@Param('id') _id: string): Promise<User> {
		return await this.userService.getUserById(_id);
	}

	@ApiOperation({ summary: 'ID로 유저 스크랩 정보 조회' })
	@ApiOkResponse({
		description: 'ID로 유저 스크랩 정보 조회 성공',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID를 입력했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get(':id/scraps')
	async getScrapsById(@Param('id') _id: string): Promise<Types.ObjectId[]> {
		return await this.userService.getScrapsById(_id);
	}

	@ApiOperation({ summary: '유저 닉네임 중복 여부 확인하기' })
	@ApiCreatedResponse({
		description: '유저 닉네임 중복 여부 확인 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiBody({ type: String })
	@Post('checknickname')
	async checkNickname(@Body() body: checknickname): Promise<string> {
		return await this.userService.checkDuplicateNickname(body.nickname);
	}

	@ApiOperation({ summary: '유저 이메일 중복 여부 확인하기' })
	@ApiCreatedResponse({
		description: '유저 이메일 중복 여부 확인 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiBody({ type: String })
	@Post('checkemail')
	async checkEmail(@Body() body: checkemail): Promise<string> {
		return await this.userService.checkDuplicateEmail(body.email);
	}

	@ApiOperation({ summary: '유저 정보 등록하기' })
	@ApiCreatedResponse({
		description: '유저 정보 등록 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력 또는 데이터를 누락했을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '유저 생성에 실패했을 경우',
	})
	@ApiBody({ type: UserSignupDto })
	@Post()
	async createUser(@Body() body: UserSignupDto): Promise<User> {
		return await this.userService.createUser(body);
	}

	@ApiOperation({ summary: '유저 정보 수정하기' })
	@ApiOkResponse({
		description: '유저 정보 수정 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저를 찾지 못한 경우',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력 또는 데이터를 누락했을 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID 또는 유저 정보 수정에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBody({ type: UserUpdateDto })
	@ApiBearerAuth('Authorization')
	@Patch(':id')
	@UseGuards(AuthGuard)
	async updateUser(
		@Param('id') _id: string,
		@Body() body: UserUpdateDto,
	): Promise<User> {
		return await this.userService.updateUser(_id, body);
	}

	@ApiOperation({ summary: '유저 스크랩 & 스토어 스크랩 등록하기' })
	@ApiOkResponse({
		description: '유저 스크랩 & 스토어 스크랩 등록 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저 혹은 스토어를 찾지 못한 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID 또는 스크랩 등록에 실패했을 경우',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiParam({ name: 'storeId', type: String })
	@ApiBearerAuth('Authorization')
	@Patch(':userId/scrapStore/:storeId')
	@UseGuards(AuthGuard)
	async updateScrap(
		@Param('userId') userId: string,
		@Param('storeId') storeId: string,
	): Promise<User> {
		return await this.userService.updateScrap(userId, storeId);
	}

	@ApiOperation({ summary: '유저 스크랩 & 스토어 스크랩 취소하기' })
	@ApiOkResponse({
		description: '유저 스크랩 & 스토어 스크랩 취소 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저 혹은 스토어를 찾지 못한 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID 또는 스크랩 취소에 실패했을 경우',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiParam({ name: 'storeId', type: String })
	@ApiBearerAuth('Authorization')
	@Patch(':userId/unscrapStore/:storeId')
	@UseGuards(AuthGuard)
	async updateUnScrap(
		@Param('userId') userId: string,
		@Param('storeId') storeId: string,
	): Promise<User> {
		return await this.userService.updateUnscrap(userId, storeId);
	}

	@ApiOperation({ summary: '유저 팔로우하기' })
	@ApiOkResponse({
		description: '유저 팔로우 등록 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저들을 찾지 못한 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID 또는 팔로우 등록에 실패했을 경우',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiParam({ name: 'targetId', type: String })
	@ApiBearerAuth('Authorization')
	@Patch(':userId/follow/:targetId')
	@UseGuards(AuthGuard)
	async updateFollow(
		@Param('userId') userId: string,
		@Param('targetId') targetId: string,
	): Promise<User> {
		return await this.userService.updateFollow(userId, targetId);
	}

	@ApiOperation({ summary: '유저 언팔로우하기' })
	@ApiOkResponse({
		description: '유저 팔로우 등록 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저들을 찾지 못한 경우',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '잘못된 ID 또는 팔로우 등록에 실패했을 경우',
	})
	@ApiParam({ name: 'userId', type: String })
	@ApiParam({ name: 'targetId', type: String })
	@ApiBearerAuth('Authorization')
	@Patch(':userId/unfollow/:targetId')
	@UseGuards(AuthGuard)
	async updateUnfollow(
		@Param('userId') userId: string,
		@Param('targetId') targetId: string,
	): Promise<User> {
		return await this.userService.updateUnfollow(userId, targetId);
	}

	@ApiOperation({ summary: '유저 정보 삭제하기' })
	@ApiOkResponse({
		description: '게시글 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저를 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '게시글 삭제에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBearerAuth('Authorization')
	@Delete(':id')
	@UseGuards(AuthGuard)
	async deleteUser(@Param('id') _id: string): Promise<User> {
		return await this.userService.deleteUser(_id);
	}

	@ApiOperation({ summary: '유저 정보 선택 삭제하기' })
	@ApiOkResponse({
		description: '게시글 삭제 성공',
	})
	@ApiUnauthorizedResponse({
		description: '헤더 토큰이 없을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 유저를 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '게시글 삭제에 실패했을 경우',
	})
	@ApiBody({ type: Array<String> })
	@ApiBearerAuth('Authorization')
	@Delete()
	@UseGuards(AuthGuard)
	async deleteSelectUsers(@Body() ids: string[]): Promise<void> {
		return await this.userService.deleteUsers(ids);
	}
}
