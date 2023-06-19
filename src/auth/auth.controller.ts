import {
	Controller,
	Body,
	Post,
	HttpCode,
	HttpStatus,
	Get,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/user.service';
import { UserLoginDto } from 'src/users/dto/user.login.dto';
import { AuthGuard } from './auth.guard';
import {
	ApiOperation,
	ApiTags,
	ApiBearerAuth,
	ApiOkResponse,
	ApiNotFoundResponse,
	ApiInternalServerErrorResponse,
	ApiForbiddenResponse,
	ApiBody,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@ApiOperation({
		summary: '유저 로그인 토큰 발급',
		description: '이메일과 비밀번호를 통해 로그인을 진행',
	})
	@ApiOkResponse({
		description: '로그인 후 토큰 발급',
	})
	@ApiNotFoundResponse({
		description: '이메일이 틀렸을 때 발생',
	})
	@ApiInternalServerErrorResponse({
		description: '비밀번호가 틀렸을 때 발생',
	})
	@ApiBody({ type: UserLoginDto })
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async logIn(@Body() body: UserLoginDto): Promise<object> {
		const { email, pw } = body;
		console.log(body);
		return await this.authService.login(email, pw);
	}

	@ApiOperation({
		summary: '유저 로그인 토큰 인증',
		description: '토큰을 통해 로그인한 유저의 정보를 받아옴',
	})
	@ApiOkResponse({
		description: '토큰으로 로그인한 유저의 정보 조회',
	})
	@ApiForbiddenResponse({
		description: '발급받은 토큰이 인증이 안 될 때',
	})
	@ApiBearerAuth('Authorization')
	@UseGuards(AuthGuard)
	@Get('profile')
	async getProfile(@Request() req): Promise<object> {
		if (req.user) {
			const result = await this.userService.getUserById(req.user.sub);
			return result;
		}
	}
}
