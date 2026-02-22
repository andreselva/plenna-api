export const RedisKeys = {
    clientUserModuleTree: (clientId: number, userId: number) => `client_user_modules_tree:${clientId}:${userId}`,
    passwordResetToken: (hash: string) => `auth:pwdreset:token:${hash}`
} as const;