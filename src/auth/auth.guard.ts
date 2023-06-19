import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	//verifyToken
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_SECRET_KEY,
			});
			request['user'] = payload;
			return true;
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError) {
				throw new UnauthorizedException('JWT 토큰이 만료되었습니다.');
			}
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
