import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		UserModule,
		ConfigModule.forRoot({ isGlobal: true }),
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET_KEY,
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
