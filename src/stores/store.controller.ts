import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { PaginateResult } from 'mongoose';
import { StoreRequestDto } from './dto/store.request.dto';
import { StoreUpdateDto } from './dto/store.update.dto';
import { StoreService } from './store.service';
import { Store } from './store.schema';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiProperty,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';

class CoordQuery {
	@ApiProperty({
		example: '37.133132',
		description: '스토어 좌표 경도',
	})
	x: string;

	@ApiProperty({
		example: '127.3231312',
		description: '스토어 좌표 위도',
	})
	y: string;

	@ApiProperty({
		example: '1000',
		description: '스토어 검색 범위(km)',
	})
	distance: string;
}

@Controller('/stores')
@ApiTags('Store')
export class StoreController {
	constructor(private readonly storeServcie: StoreService) {}

	@ApiOperation({ summary: '모든 스토어 정보 조회' })
	@ApiOkResponse({
		description: '모든 스토어 정보 조회 성공',
	})
	@Get()
	async getAllStore(): Promise<Store[]> {
		return await this.storeServcie.getAllStores();
	}

	@ApiOperation({ summary: '스토어 목록 페이지네이션' })
	@ApiOkResponse({
		description: '스토어 목록 페이지네이션 성공',
	})
	@Get('pages')
	async getPaginate(
		@Query('page') page: number = 1,
	): Promise<PaginateResult<Store>> {
		return await this.storeServcie.getPaginate(page);
	}

	@ApiOperation({ summary: 'ID로 스토어 정보 조회' })
	@ApiOkResponse({
		description: 'ID로 스토어 정보 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 스토어가 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: 'ID가 비어있을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@Get('store/:id')
	async getStoreById(@Param('id') _id: string): Promise<Store> {
		return await this.storeServcie.getStoreById(_id);
	}

	@ApiOperation({ summary: '날짜로 스토어 정보 조회' })
	@ApiOkResponse({
		description: '날짜로 스토어 정보 조회 성공 ',
	})
	@ApiNotFoundResponse({
		description: '시작 날짜 또는 종료 날짜를 잘못 입력했을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '날짜가 비어있을 경우',
	})
	@ApiParam({ name: 'start', type: Date })
	@ApiParam({ name: 'end', type: Date })
	@Get('date/:start/:end')
	async getStoresByDate(
		@Param('start') startDate: Date,
		@Param('end') endDate: Date,
	): Promise<Store[]> {
		return await this.storeServcie.getStoresByDate(startDate, endDate);
	}

	@ApiOperation({ summary: '좌표 위치 주변 스토어 정보 조회' })
	@ApiOkResponse({
		description: '좌표 위치 주변 스토어 정보 조회 성공 ',
	})
	@ApiInternalServerErrorResponse({
		description: '쿼리문이 없거나 조회에 실패했을 경우',
	})
	@Get('coord')
	async getStoresByCoord(@Query() query: CoordQuery): Promise<Store[]> {
		const { x, y, distance } = query;
		const longtitude = Number(y);
		const latitude = Number(x);
		const searchDistance = Number(distance);

		return await this.storeServcie.getStoresByCoord(
			longtitude,
			latitude,
			searchDistance,
		);
	}

	@ApiOperation({ summary: '카테고리별 스토어 정보 조회 ' })
	@ApiOkResponse({
		description: '카테고리별 스토어 정보 조회 성공',
	})
	@ApiNotFoundResponse({
		description: '해당하는 카테고리가 없을 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '카테고리가 비어있을 경우',
	})
	@ApiParam({ name: 'category', type: String })
	@Get('category/:category')
	async getStoresByCategory(
		@Param('category') category: string,
	): Promise<Store[]> {
		return await this.storeServcie.getStoresByCategory(category);
	}

	@ApiOperation({ summary: '스토어 정보 등록하기' })
	@ApiCreatedResponse({
		description: '스토어 정보 등록 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력하거나 입력할 데이터가 누락될 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '스토어 생성에 실패했을 경우',
	})
	@ApiBody({ type: StoreRequestDto })
	@Post()
	async create(@Body() body: StoreRequestDto): Promise<Store> {
		return await this.storeServcie.createStore(body);
	}

	@ApiOperation({ summary: '스토어 정보 수정하기' })
	@ApiCreatedResponse({
		description: '스토어 정보 수정 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiNotFoundResponse({
		description: '해당하는 ID의 스토어를 찾지 못한 경우',
	})
	@ApiInternalServerErrorResponse({
		description: '스토어 수정에 실패했을 경우',
	})
	@ApiParam({ name: 'id', type: String })
	@ApiBody({ type: StoreUpdateDto })
	@Patch(':id')
	async update(
		@Param('id') _id: string,
		@Body() body: StoreUpdateDto,
	): Promise<Store> {
		return await this.storeServcie.updateStore(_id, body);
	}

	@ApiOperation({ summary: '스토어 정보 삭제하기' })
	@ApiOkResponse({
		description: '스토어 정보 삭제 성공',
	})
	@ApiBadRequestResponse({
		description: '잘못된 데이터를 입력했을 경우',
	})
	@ApiBody({ type: Array<String> })
	@Delete()
	async delete(@Body() ids: string[]): Promise<void> {
		return await this.storeServcie.deleteStores(ids);
	}
}
