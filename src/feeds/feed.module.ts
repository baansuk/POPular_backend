import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './feed.schema';
import { FeedsController } from './feed.controller';
import { FeedsService } from './feed.service';
import { CommentsModule } from 'src/comments/comment.module';
import { Comment, CommentSchema } from 'src/comments/comment.schema';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
		forwardRef(() => CommentsModule),
	],
	exports: [FeedsService],
	controllers: [FeedsController],
	providers: [FeedsService],
})
export class FeedsModule {}
