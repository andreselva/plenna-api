export const RedisKeys = {
    clientUserModuleTree: (clientId: number, userId: number) => `client_user_modules_tree:${clientId}:${userId}`,
    resetUserPassword: (userId: number) => `auth:pwdreset:user:${userId}`,
    resetUserPasswordHash: (hash: string) => `auth:pwdreset:token:${hash}`
} as const;