import { CookieOptions } from "express";

export class AuthCookieOptions {
    static accessToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'development' ? '' : '.plenna.me',
            maxAge: 60 * 60 * 1000,//1h
        };
    }

    static refreshToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'development' ? '' : '.plenna.me',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    }

    static csrfToken(): CookieOptions {
        return {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'development' ? '' : '.plenna.me',
            maxAge: 60 * 60 * 1000,
        };
    }

    static clearToken(): CookieOptions {
        return {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'development' ? '' : '.plenna.me',
        }
    }

    static clearCsrfToken(): CookieOptions {
        return {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            domain: process.env.NODE_ENV === 'development' ? '' : '.plenna.me',
        }
    }
}
