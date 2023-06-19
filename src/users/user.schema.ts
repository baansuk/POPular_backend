import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';

const options: SchemaOptions = {
	timestamps: true,
	collection: 'User',
};

export class user_profile {
	_id: string;
	nickname: string;
	profile: string;
}

@Schema(options)
export class User extends Document {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true })
	pw: string;

	@Prop({ required: true })
	name: string;

	@Prop({ required: true, unique: true })
	nickname: string;

	@Prop({ required: true })
	phone_number: string;

	@Prop({ default: [] })
	follower: user_profile[];

	@Prop({ default: [] })
	following: user_profile[];

	@Prop({ default: 'user' })
	role: string;

	@Prop({ default: [] })
	interested_category: string[];

	@Prop({ default: 'http://34.22.81.36:3000/uploads/defaultProfile.svg' })
	profile: string;

	@Prop({ default: '한 줄 소개를 넣어주세요!' })
	introduce: string;

	@Prop({ required: true })
	allow_notification: boolean;

	@Prop({ type: [{ type: Types.ObjectId, ref: 'Store' }], default: [] })
	scraps: Types.ObjectId[];

	@Prop({ type: Types.ObjectId, ref: 'Notification', default: [] })
	notifications: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
