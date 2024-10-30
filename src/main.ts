import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Technology Knowledge DB API')
    .setDescription('The Technology Knowledge DB API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Middlewares globales
  app.use(helmet()); // configura cabeceras HTTP para proteger contra vulnerabilidades comunes
  app.use(compression()); // comprimir las respuestas HTTP
  app.enableCors();
  app.use(new LoggerMiddleware().use);

  // Pipes globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptores globales
  app.useGlobalInterceptors(new TransformInterceptor());

  // Filtros globales
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
