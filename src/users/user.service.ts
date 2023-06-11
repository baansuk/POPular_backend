import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { Store } from 'src/stores/store.schema';
import { UserSignupDto } from './dto/user.signup.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { hashPassword, comparePasswords } from '../utils/hassing.util';
import { handleImage } from 'src/utils/handle.image.util';


@Injectable()
export class UserService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(Store.name) private readonly storeModel: Model<Store>,
	) { }

	async getAllUsers(): Promise<User[]> {
		return await this.userModel.find();
	}

	async getUserByEmail(email: string): Promise<User> {
		return await this.userModel.findOne({ email });
	}

	async getUserById(_id: string): Promise<User> {
		return await this.userModel.findById({ _id });
	}

	async checkDuplicateNickname(nickname: string): Promise<string> {
		const existingUser = await this.userModel.findOne({ nickname });
		return JSON.stringify({ isExists: !!existingUser });
	}

	async checkDuplicateEmail(email: string): Promise<string> {
		const existingUser = await this.userModel.findOne({ email });
		return JSON.stringify({ isExists: !!existingUser });
	}

	async createUser(body: UserSignupDto): Promise<User> {
		const pw = body.pw;
		const hashedPassword = await hashPassword(pw);

		const newUser = {
			...body,
			pw: hashedPassword,
		};

		return await this.userModel.create(newUser);
	}

	async updateUser(_id: string, body: UserUpdateDto): Promise<any> {
		const user = await this.userModel.findById(_id);

		if (!user) {
			throw new NotFoundException('사용자를 찾을 수 없습니다!');
		}

		if (body.profile) {
			const base64Image = body.profile;
			const imageUrl = await handleImage(base64Image, './uploads', '');
			user.profile = imageUrl;
		}

		if (body.pw) {
			const newPw = await hashPassword(body.pw);
			user.pw = newPw;
		}

		if(body.introduce) {
			user.introduce = body.introduce;
		}

		if(body.nickname) {
			user.nickname = body.nickname;
		}

		if(body.phone_number) {
			user.phone_number = body.phone_number;
		}

		if(body.interested_category) {
			user.interested_category = body.interested_category;
		}

		if(body.allow_notification !== undefined) {
			user.allow_notification = body.allow_notification;
		}

		return user.save();
	}

	async updateScrap(userId: string, storeId: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		const store = await this.storeModel.findById(storeId);

		const storeObjId = new Types.ObjectId(storeId);
		const userObjId = new Types.ObjectId(userId);

		console.log(store.scraps);

		if (user && store) {
			if (!user.scraps.includes(storeObjId)) {
				user.scraps.push(storeObjId);
			}
			if (!store.scraps.includes(userObjId)) {
				store.scraps.push(userObjId);
			}

			user.save();
			store.save();
		} else {
			throw new BadRequestException({ message: '제대로 값을 못 받아옴' });
		}

		return user;
	}

	async updateUnscrap(userId: string, storeId: string): Promise<User> {
		const user = await this.userModel.findById(userId);
		const store = await this.storeModel.findById(storeId);

		const storeObjId = new Types.ObjectId(storeId);
		const userObjId = new Types.ObjectId(userId);

		if (user && store) {
			const sIndex = user.scraps.indexOf(storeObjId);
			const uIndex = store.scraps.indexOf(userObjId);

			if (sIndex !== -1) {
				user.scraps.splice(sIndex, 1);
			}

			if (uIndex !== -1) {
				store.scraps.splice(uIndex, 1);
			}

			await user.save();
			await store.save();
		}

		return user;
	}

	async updateFollow(user_id: string, target_id: string): Promise<User> {
		const user = await this.userModel.findById(user_id);
		const target = await this.userModel.findById(target_id);

		const followingInfo = {
			_id: user._id.toString(),
			nickname: user.nickname,
			profile: user.profile,
		};

		const followerInfo = {
			_id: target._id.toString(),
			nickname: target.nickname,
			profile: target.profile,
		};

		if (user && target) {
			if (!user.following.includes(followerInfo)) {
				user.following.push(followerInfo);
			}

			if (!target.follower.includes(followingInfo)) {
				target.follower.push(followingInfo);
			}

			user.save();
			target.save();
		}

		return user;
	}

	async updateUnfollow(user_id: string, target_id: string): Promise<User> {
		const user = await this.userModel.findById(user_id);
		const target = await this.userModel.findById(target_id);

		if (user && target) {
			for (const item of user.following) {
				if (item._id === target_id) {
					user.following.splice(user.following.indexOf(item), 1);
				}
			}

			for (const item of target.follower) {
				if (item._id === user_id) {
					target.follower.splice(target.follower.indexOf(item), 1);
				}
			}

			user.save();
			target.save();
		}

		return user;
	}

	async deleteUser(_id: string): Promise<User> {
		return await this.userModel.findByIdAndDelete(_id);
	}
}
