import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { GlobalAuthGuard } from './common/guards/global-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  // Habilita cookie parser
  app.use(cookieParser());

  //Habilitar o guards em todas as rotas. Rotas públicas devem usar @Public.
  app.useGlobalGuards(new GlobalAuthGuard(reflector));

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();