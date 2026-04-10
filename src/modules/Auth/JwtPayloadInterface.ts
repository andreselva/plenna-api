export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
  clientId: number;
  name: string;
}

export interface AccessTokenPayload {
  sub: number;
  username: string;
  role: string;
  clientId: number;
  name: string;
}

export interface RefreshTokenPayload {
  sub: number;
  clientId: number;
}
