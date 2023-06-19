import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult, Types } from 'mongoose';
import { Store } from './store.schema';
import { StoreRequestDto } from './dto/store.request.dto';
import { StoreUpdateDto } from './dto/store.update.dto';
import { handleImages } from 'src/utils/handle.images.util';
import { User } from 'src/users/user.schema';

@Injectable()
export class StoreService {
	constructor(
		@InjectModel(Store.name) private readonly storeModel: PaginateModel<Store>,
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async getAllStores(): Promise<Store[]> {
		return await this.storeModel.find();
	}

	async getPaginate(page: number): Promise<PaginateResult<Store>> {
		return await this.storeModel.paginate(
			{},
			{
				sort: { createdAt: -1 },
				page: page,
				limit: 20,
			},
		);
	}

	async getStoreById(_id: string): Promise<Store> {
		const result = await this.storeModel.findById(_id);
		if (!result) {
			throw new NotFoundException('해당하는 스토어가 존재하지 않습니다.');
		}
		return result;
	}

	async getStoresByDate(startDate: Date, endDate: Date): Promise<Store[]> {
		return await this.storeModel.find({
			start_date: { $gte: startDate },
			end_date: { $lte: endDate },
		});
	}

	async getStoresByCoord(
		lng: Number,
		lat: Number,
		distance: Number,
	): Promise<Store[]> {
		return await this.storeModel.find({
			coord: {
				$nearSphere: {
					$geometry: {
						type: 'Point',
						coordinates: [lng, lat],
					},
					$maxDistance: distance,
				},
			},
		});
	}

	async getStoresByCategory(category: string): Promise<Store[]> {
		return await this.storeModel.find({
			category: category,
		});
	}

	async createStore(body: StoreRequestDto): Promise<Store> {
		const base64Images = body.images;
		const imageMapping = await handleImages(base64Images);

		const lng = body.coord.coordinates[0];
		const lat = body.coord.coordinates[1];

		const newStore = {
			...body,
			images: Object.values(imageMapping),
			coord: {
				type: 'Point',
				coordinates: [lng, lat],
			},
		};

		return await this.storeModel.create(newStore);
	}

	async updateStore(_id: string, body: StoreUpdateDto): Promise<Store> {
		const store = await this.storeModel.findById(_id);

		if (!store) {
			throw new NotFoundException('스토어를 찾을 수 없습니다.');
		}

		const storeImages = body.images;
		const images = storeImages.filter(image => image.startsWith('http://'));
		const filteredImages = storeImages.filter(
			image => !image.startsWith('http://'),
		);

		const imageMapping = await handleImages(filteredImages);
		const transformImages = Object.values(imageMapping);
		const imageUrls = [...images, ...transformImages];

		const updateStore = {
			...body,
			images: imageUrls,
		};

		return await this.storeModel.findByIdAndUpdate(_id, updateStore, {
			new: true,
		});
	}

	async deleteStores(ids: string[]): Promise<void> {
		const stores = await this.storeModel.find({ _id: { $in: ids } });

		for (const store of stores) {
			const storeId = store._id;
			for (const id of store.scraps) {
				const user = await this.userModel.findById(id);
				user.scraps.splice(user.scraps.indexOf(storeId), 1);
				await user.save();
			}
		}
		await this.storeModel.deleteMany({ _id: { $in: ids } });
	}
}
