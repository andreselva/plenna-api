import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (!(exception instanceof HttpException)) {
      const isUnknown = !(exception instanceof Error);
      if (isUnknown) throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionName = (exception as any)?.constructor?.name ?? 'UnknownException';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      const responsePayload = typeof errorResponse === 'string'
        ? { message: errorResponse }
        : (errorResponse as object);

      this.logger.error(
        `[${exceptionName}] ${status} ${request.method} ${request.url}`,
        JSON.stringify(responsePayload),
      );

      response.status(status).json({
        ...responsePayload,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    } else {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      this.logger.error(
        `[${exceptionName}] Internal Server Error... ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: 'Ocorreu um erro interno inesperado no servidor.',
      });
    }
  }
}