import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

type WorkerAuthContext = {
  userId: number | null;
  tenantId: number | null;
  roles: string[];
  clientId: number | null;
  user?: { id: number; username: string; role: string; clientId: number } | null;
};

@Injectable()
export class WorkerAuthContextService {
  private readonly als = new AsyncLocalStorage<WorkerAuthContext>();

  runWithContext<T>(ctx: WorkerAuthContext, fn: () => Promise<T> | T): Promise<T> | T {
    return this.als.run(ctx, fn);
  }

  getContext(): WorkerAuthContext {
    return (
      this.als.getStore() ?? {
        userId: null,
        tenantId: null,
        roles: [],
        clientId: null,
        user: null,
      }
    );
  }

  getUser() {
    return this.getContext().user ?? null;
  }

  getUserId(): number | null {
    return this.getContext().userId;
  }

  getTenantId(): number | null {
    return this.getContext().tenantId;
  }

  getRoles(): string[] {
    return this.getContext().roles;
  }

  getRole(): string | null {
    const user = this.getUser();
    if (user?.role) {
      return user.role;
    }

    const roles = this.getRoles();
    return roles.length > 0 ? roles[0] ?? null : null;
  }

  isAdmin(): boolean {
    const roles = this.getContext().roles ?? [];
    return roles.includes('admin') || roles.includes('system');
  }

  getClientId(): number | null {
    return this.getContext().clientId;
  }
}
