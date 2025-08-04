import { CookieOptions } from "express";

export class AuthCookieOptions {
    static accessToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,//1h
        };
    }

    static refreshToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    }

    static clearToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
        }
    }
}