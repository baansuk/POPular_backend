import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions, Types } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

const options: SchemaOptions = {
	timestamps: true,
	collection: 'Store',
};

class time {
	start: string | null;
	end: string | null;
}

class day {
	mon: time;
	tue: time;
	wed: time;
	thu: time;
	fri: time;
	sat: time;
	sun: time;
}

class postinfo {
	sido: string;
	sigungu: string;
}

class coordinfo {
	@Prop({ default: 'Point' })
	type: string;
	coordinates: number[];
}

class snsinfo {
	link_type: string;
	link_title: string;
	link_url: string;
}

@Schema(options)
export class Store extends Document {
	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	category: string;

	@Prop({ required: true })
	start_date: Date;

	@Prop({ required: true })
	end_date: Date;

	@Prop({ type: day, required: true })
	hours: day;

	@Prop({ required: true })
	location: string;

	@Prop({ type: postinfo, required: true })
	postcode: postinfo;

	@Prop({ type: coordinfo, required: true })
	coord: coordinfo;

	@Prop({ required: true, default: 0 })
	price: number;

	@Prop({ type: Array })
	sns: snsinfo[];

	@Prop({ default: false })
	reservation_required: boolean;

	@Prop()
	images: string[];

	@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
	scraps?: Types.ObjectId[];
}

const schema = SchemaFactory.createForClass(Store);
schema.plugin(mongoosePaginate);
export const StoreSchema = schema;
StoreSchema.index({ coord: '2dsphere' });
