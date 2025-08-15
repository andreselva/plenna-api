import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/enum/role.enum';
import { ROLES_KEY } from '../decorators/roles.decoratos';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Este método é o núcleo do Guard. Ele decide se a requisição pode ou não prosseguir.
   * Retorna 'true' para permitir e 'false' para bloquear.
   * @param context - O contexto da execução da requisição.
   */
  canActivate(context: ExecutionContext): boolean {
    // Ler as funções necessárias do decorator @Roles do endpoint
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Estratégia: primeiro olha o método
      context.getClass(),   // Depois, olha a classe
    ]);

    // Se não há @Roles no endpoint, ele é considerado público para este Guard.
    // A proteção de login (autenticação) deve ser feita por outro Guard (ex: JwtAuthGuard).
    if (!requiredRoles) {
      return true;
    }

    // Obter o usuário da requisição (que foi injetado pelo Guard de autenticação)
    const { user } = context.switchToHttp().getRequest();

    // Se não houver usuário (ex: token inválido ou ausente), nega o acesso.
    if (!user || !user.funcao) {
        return false;
    }

    // Comparar a função do usuário com as funções requeridas
    // O método 'some' retorna true se pelo menos uma das roles requeridas corresponder à do usuário.
    return requiredRoles.some((role) => user.funcao === role);
  }
}