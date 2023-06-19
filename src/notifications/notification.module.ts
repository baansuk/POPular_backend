import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationsController } from './notification.controller';
import { NotificationsService } from './notification.service';
import { CommentsModule } from 'src/comments/comment.module';
import { UserModule } from 'src/users/user.module';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Notification.name, schema: NotificationSchema },
		]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		forwardRef(() => CommentsModule),
		forwardRef(() => UserModule),
	],
	controllers: [NotificationsController],
	providers: [NotificationsService],
	exports: [NotificationsService],
})
export class NotificationsModule {}
