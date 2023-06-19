import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './utils/swagger.util';
import * as express from 'express';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.useGlobalPipes(new ValidationPipe());
	app.enableCors();
	setupSwagger(app);
	app.use(express.json({ limit: '50mb' }));
	app.use(express.urlencoded({ limit: '50mb', extended: true }));
	app.useStaticAssets(path.join(__dirname, '..', ''));
	await app.listen(3000);
}

bootstrap();
