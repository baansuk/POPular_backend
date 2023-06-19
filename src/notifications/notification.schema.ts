import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import { User } from 'src/users/user.schema';
import { Comment } from 'src/comments/comment.schema';
import { Store } from 'src/stores/store.schema';
import { BoardType } from 'src/feeds/feed.schema';

const options: SchemaOptions = {
	timestamps: true,
	collection: 'Notification',
};

export enum NotificationType {
	FOLLOW = 'follow',
	COMMENT = 'comment',
	RECOMMENT = 'recomment',
	AD = 'ad',
}

@Schema(options)
export class Notification extends Document {
	@Prop({ type: String, required: true, enum: Object.values(NotificationType) })
	type: NotificationType;

	@Prop()
	board?: BoardType;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	user_id: Types.ObjectId | User;

	@Prop({ type: Types.ObjectId, ref: 'User' })
	content_user?: Types.ObjectId | User;

	@Prop({ type: Types.ObjectId, ref: 'Store' })
	content_store?: Types.ObjectId | Store;

	@Prop({ type: Types.ObjectId, ref: 'Comment' })
	content_comment?: Types.ObjectId | Comment;

	@Prop({ default: false })
	checked: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
