import { INestApplication } from '@nestjs/common';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerCustomOptions,
} from '@nestjs/swagger';
import * as fs from 'fs';

const swaggerCustomOptions: SwaggerCustomOptions = {
	//웹 페이지 새로고침해도 jwt 토큰 값 유지
	swaggerOptions: {
		persistAuthorization: true,
	},
};

export function setupSwagger(app: INestApplication): void {
	const config = new DocumentBuilder()
		.setTitle('POPular API')
		.setDescription('POPular API입니다.')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'Authorization',
				in: 'header',
			},
			'token',
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
	SwaggerModule.setup('swagger', app, document, swaggerCustomOptions);
}
