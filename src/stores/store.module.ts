import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { Store, StoreSchema } from './store.schema';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	],
	controllers: [StoreController],
	providers: [StoreService],
})
export class StoreModule {}
