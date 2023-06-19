import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import { Comment } from 'src/comments/comment.schema';
import { Store } from 'src/stores/store.schema';
import { User } from 'src/users/user.schema';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const options: SchemaOptions = {
	timestamps: true,
	collection: 'Post',
};

export enum BoardType {
	GATHER = 'gather',
	REVIEW = 'review',
	FREE = 'free',
}

@Schema(options)
export class Feed extends Document {
	@Prop({ required: true })
	title: string;

	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	author: Types.ObjectId | User;

	@Prop({ required: true, enum: BoardType })
	board: BoardType;

	@Prop({ required: true })
	content: string;

	@Prop({ default: [] })
	images: Array<string>;

	@Prop({ type: Types.ObjectId, ref: 'Store' })
	store_id?: Types.ObjectId | Store;

	@Prop({ min: 1, max: 5 })
	ratings?: number;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	likes: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	reports: Types.ObjectId[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
	comments: Types.ObjectId[] | Comment[];

	@Prop({ default: 0 })
	views: number;
}

const schema = SchemaFactory.createForClass(Feed);
schema.plugin(mongooseAggregatePaginate);
export const FeedSchema = schema;
