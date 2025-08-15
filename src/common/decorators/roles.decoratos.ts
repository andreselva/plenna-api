import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/enum/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator @Roles.
 * Ele recebe uma lista de funções (roles) e as anexa como metadados
 * ao endpoint onde for utilizado.
 * Exemplo de uso: @Roles(Role.Admin, Role.Editor)
 * @param roles - Uma lista de roles do nosso Enum 'Role'.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);