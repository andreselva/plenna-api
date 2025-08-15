export interface JwtPayload {
  username: string;
  sub: number;
  role: string;
  clientId: number;
}