import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activa las validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Ignora datos extra que envíe el usuario y no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error 400 si envían propiedades no permitidas
    transform: true, // Transforma automáticamente los tipos (ej: string a number en los IDs)
  }));

  await app.listen(3000);
}
bootstrap();