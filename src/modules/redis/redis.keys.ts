export const RedisKeys = {
    clientUserModuleTree: (clientId: number, userId: number) => `client_user_modules_tree:${clientId}:${userId}`,
    passwordResetToken: (hash: string) => `auth:pwdreset:token:${hash}`,
    sequenceNumber: (clientId: number) => `financial:events:sequence:number:${clientId}`,
    previousHash: (clientId: number) => `financial:events:previous:hash:${clientId}` 
} as const;