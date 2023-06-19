import {
	IsString,
	IsArray,
	IsNumber,
	IsBoolean,
	IsDate,
	ValidateNested,
	IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class time {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '08:00',
		description: '스토어 시작 시간',
	})
	start?: string | null;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '08:00',
		description: '스토어 종료 시간',
	})
	end?: string | null;
}

class day {
	@ValidateNested()
	mon?: time;

	@ValidateNested()
	tue?: time;

	@ValidateNested()
	wed?: time;

	@ValidateNested()
	thu?: time;

	@ValidateNested()
	fri?: time;

	@ValidateNested()
	sat?: time;

	@ValidateNested()
	sun?: time;
}

class postinfo {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '대구',
		description: '스토어 위치(시)',
	})
	sido?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '중구',
		description: '스토어 위치(군/구)',
	})
	sigungu?: string;
}

class coordinfo {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'Point',
		description: '스토어 위치 검색용(Point 고정)',
	})
	type?: string;

	@IsArray()
	@ApiProperty({
		example: '[127.23414, 34.1234]',
		description: '스토어 위치 검색용(좌표)',
	})
	coordinates?: number[];
}

class snsinfo {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'insta',
		description: '스토어 SNS 종류',
	})
	link_type?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '블루보틀 인스타그램',
		description: '스토어 SNS 이름',
	})
	link_title?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: 'http://www.instagram.com',
		description: '스토어 SNS 링크 주소',
	})
	link_url?: string;
}

export class StoreUpdateDto {
	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '홍대 팝업 스토어',
		description: '팝업 스토어 이름',
	})
	title?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '홍대 팝업 스토어 오픈! ...',
		description: '팝업 스토어 설명',
	})
	description?: string;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '의류',
		description: '팝업 스토어 종류',
	})
	category?: string;

	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@ApiProperty({
		example: '2023-05-31T12:34:56.789Z',
		description: '팝업 스토어 시작일',
	})
	start_date?: Date;

	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@ApiProperty({
		example: '2023-05-31T12:34:56.789Z',
		description: '팝업 스토어 종료일',
	})
	end_date?: Date;

	@ValidateNested()
	@IsOptional()
	@ApiProperty({
		example: '{{mon: {08:00, 18:00} ... }}',
		description: '팝업 스토어 운영시간',
	})
	hours?: day;

	@IsString()
	@IsOptional()
	@ApiProperty({
		example: '서울시 성동구 OOO',
		description: '팝업 스토어 위치',
	})
	location?: string;

	@ValidateNested()
	@IsOptional()
	@ApiProperty({
		example: '{ sido: 대구, sigungu: 중구 }',
		description: '팝업 스토어 시, 군/구',
	})
	postcode?: postinfo;

	@ValidateNested()
	@IsOptional()
	@ApiProperty({
		example: '{ type: Point, coordinates: [127.6346, 34.1245](경도, 위도 순) }',
		description: '팝업 스토어 위치 좌표',
	})
	coord?: coordinfo;

	@IsNumber()
	@IsOptional()
	@ApiProperty({
		example: '3000',
		description: '팝업 스토어 입장료',
	})
	price?: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@ApiProperty({
		example: '[{insta, 홍대 인스타그램, http://...}]',
		description: '팝업 스토어 SNS 정보',
	})
	sns?: snsinfo[];

	@IsBoolean()
	@IsOptional()
	@ApiProperty({
		example: 'true',
		description: '팝업 스토어 예약 필요 여부',
	})
	reservation_required?: boolean;

	@IsArray()
	@IsOptional()
	@ApiProperty({
		example: '[1.png, 2.png]',
		description: '팝업 스토어 이미지',
	})
	images?: string[];

	@IsArray()
	@IsOptional()
	@ApiProperty({
		example: '[123, 424, 124]',
		description: '팝업 스토어 스크랩 리스트',
	})
	scraps?: Types.ObjectId[];
}
