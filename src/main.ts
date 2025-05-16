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
    origin: 'https://financial-system-production.up.railway.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();