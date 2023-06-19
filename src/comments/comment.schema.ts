import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	Document,
	SchemaOptions,
	Schema as MongooseSchema,
	Types,
} from 'mongoose';
import { BoardType, Feed } from 'src/feeds/feed.schema';
import { User } from 'src/users/user.schema';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const options: SchemaOptions = {
	timestamps: true,
	collection: 'Comment',
};

export enum ParentType {
	FEED = 'Feed',
	COMMENT = 'Comment',
}

export class parentinfo {
	@Prop({ type: String, required: true })
	type: ParentType;

	@Prop({ type: Types.ObjectId, refPath: 'type', required: true })
	id: Types.ObjectId;
}

export class ancestorinfo {
	@Prop({ required: true })
	type: BoardType;

	@Prop({ required: true })
	id: Types.ObjectId;
}

@Schema(options)
export class Comment extends Document {
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	author: Types.ObjectId | User;

	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	parent: parentinfo;

	@Prop()
	ancestor?: ancestorinfo;

	@Prop({
		type: [{ type: Types.ObjectId, ref: 'Comment' }],
		default: [],
	})
	recomments: Types.ObjectId[];
}

const schema = SchemaFactory.createForClass(Comment);
schema.plugin(mongooseAggregatePaginate);
export const CommentSchema = schema;
