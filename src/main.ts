import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { GlobalAuthGuard } from './common/guards/global-auth.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  const reflector = app.get(Reflector);

  // Habilita cookie parser
  app.use(cookieParser());

  //Habilitar o guards em todas as rotas. Rotas públicas devem usar @Public.
  app.useGlobalGuards(new GlobalAuthGuard(reflector));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades que não estão no DTO
    forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
    transform: true, // Transforma o payload para a instância do DTO
  }));
  
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? true : 'https://plenna.me',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 8001;
  await app.listen(port);
}

bootstrap();
