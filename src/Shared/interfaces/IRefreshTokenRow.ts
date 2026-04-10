export interface IRefreshTokenRow {
    refresh_token: string;
    idUser: number;
    ipAddress: string;
    userAgent: string | null;
    createdAt: Date | string | null;
    lastUsedAt: Date | string | null;
}