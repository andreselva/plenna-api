import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita cookie parser
  app.use(cookieParser());

  // Habilita CORS para o seu front (porta 3000), com credenciais
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();