import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Role } from 'src/enum/role.enum';

/**
 * Este serviço tem escopo de REQUISIÇÃO. Uma nova instância é criada para cada
 * requisição recebida e destruída após a resposta ser enviada.
 * Ele nos dá uma forma segura de acessar os dados do usuário logado
 * em qualquer lugar da aplicação via Injeção de Dependência.
 */
@Injectable({ scope: Scope.REQUEST })
export class AuthContextService {
    
    // Injetamos o objeto da requisição (REQUEST) que o NestJS nos fornece.
    constructor(@Inject(REQUEST) private readonly request: any) {}

    /**
     * Retorna o payload do usuário que foi anexado à requisição pelo AuthGuard.
     */
    getUser(): { id: number; username: string; role: Role, clientId: number } {
        return this.request.user;
    }

    /**
     * Retorna o ID do usuário logado.
     */
    getUserId(): number {
        return this.request.user?.userId;
    }

    /**
     * Retorna o clientId do usuário logado.
     */
    getClientId(): number {
        return 1;
    }

    getRole(): Role {
        return this.request.user?.role;
    }
}