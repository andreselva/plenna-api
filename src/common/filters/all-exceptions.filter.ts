import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // SE o erro for uma instância de HttpException (400, 401, 403, 404, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse(); // Pega a resposta detalhada

      const responsePayload = typeof errorResponse === 'string'
          ? { message: errorResponse }
          : (errorResponse as object);
      
      this.logger.error(`HTTP Exception... ${status} ${request.method} ${request.url}`, JSON.stringify(responsePayload));
      
      // Retorna o objeto de erro
      response.status(status).json({
          ...responsePayload,
          path: request.url,
          timestamp: new Date().toISOString(),
      });
    } else {
      // SENÃO, é um erro 500 inesperado.
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      // Logamos o erro completo para depuração.
      this.logger.error(`Internal Server Error... ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : exception);

      // E enviamos uma resposta genérica para o usuário.
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Ocorreu um erro interno inesperado no servidor.',
      });
    }
  }
}