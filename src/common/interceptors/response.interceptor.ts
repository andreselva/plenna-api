import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  payload: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    // next.handle() executa o método do controller e nos dá o resultado
    return next.handle().pipe(
      map(data => ({
        // 'data' é o valor retornado pelo controller (ex: um array de faturas)
        payload: data,
        // Geramos uma mensagem padrão com base no método da requisição (GET, POST, etc.)
        message: this.getMessageForRequest(context),
      })),
    );
  }

  /**
   * Retorna uma mensagem padrão de sucesso baseada no método HTTP.
   * @param context O contexto da execução da requisição.
   * @returns Uma string com a mensagem de sucesso.
   */
  private getMessageForRequest(context: ExecutionContext): string {
    const http = context.switchToHttp();
    const method = http.getRequest().method;

    switch (method) {
      case 'POST':
        return 'Recurso criado com sucesso.';
      case 'PUT':
      case 'PATCH':
        return 'Recurso atualizado com sucesso.';
      case 'DELETE':
        return 'Recurso removido com sucesso.';
      // Para GET e outros métodos
      default:
        return 'Operação realizada com sucesso.';
    }
  }
}