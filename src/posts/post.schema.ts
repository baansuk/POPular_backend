import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import { User } from 'src/users/user.schema';
import { Comment, CommentSchema } from 'src/comments/comment.schema';
import { Store, StoreSchema } from 'src/stores/store.schema';

const options: SchemaOptions = {
	timestamps: true,
	collection: 'Post',
};

export enum BoardType {
	Gather = 'gather',
	Review = 'review',
	Free = 'free',
}

@Schema(options)
export class Post extends Document {
	@Prop({ required: true })
	title: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	author: Types.ObjectId;

	@Prop({ required: true, enum: BoardType })
	board: BoardType;

	@Prop({ required: true })
	content: string;

	@Prop({ default: [] })
	images: Array<string>;

	@Prop({ type: Types.ObjectId, ref: 'Store' })
	storeId?: Types.ObjectId | Store;

	@Prop({ min: 1, max: 5 })
	ratings?: number;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	likes: Types.ObjectId[];
	
	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	reports: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
	comments: Types.ObjectId[] | Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);